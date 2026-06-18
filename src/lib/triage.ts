import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { db } from "../db";
import { emails, users } from "../db/schema";
import { eq } from "drizzle-orm";
// Initialize OpenAI using the key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// We force OpenAI to return exactly this JSON structure
const TriageResponseSchema = z.object({
  priority: z.enum(["Important", "Newsletter", "Other"]).describe("The priority of the email based on its content and sender."),
  summary: z.string().describe("A very short, 1-sentence summary of the email."),
});

export async function processAndStoreEmail(
  tenantId: string,
  messageId: string,
  fromAddress: string,
  toAddress: string,
  subject: string,
  bodyText: string,
  dateStr?: string,
  labels?: string[]
) {
  try {
    console.log(`[AI Triage] Starting triage for email: ${subject}`);

    // Ensure the User exists before proceeding
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, tenantId),
    });

    if (!userExists) {
      throw new Error(`CRITICAL: Attempted to triage email for unknown user: ${tenantId}`);
    }

    let priority: "Important" | "Newsletter" | "Other" = "Other";
    let summary = bodyText ? bodyText.substring(0, 100) : "No preview available";
    let embedding: number[] | null = null;

    try {
      console.log(`[AI Triage] Starting classification for email: ${subject}`);
      // 1. Classify with OpenAI (using the fast and cheap gpt-4o-mini)
      const completion = await openai.chat.completions.parse({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a Superhuman-style email triage assistant. Categorize the email into Important (real human/urgent), Newsletter (automated/subscriptions), or Other (promos/receipts/spam)."
          },
          {
            role: "user",
            content: `From: ${fromAddress}\nSubject: ${subject}\n\nBody:\n${bodyText}`
          }
        ],
        response_format: zodResponseFormat(TriageResponseSchema, "triage_result"),
      });

      const triageResult = completion.choices[0].message.parsed;
      if (triageResult) {
        priority = triageResult.priority;
        summary = triageResult.summary;
      }
      console.log(`[AI Triage] Classification complete: ${priority}`);

      // 2. Generate Vector Embedding for fast Cmd+K search
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: `Subject: ${subject}\nBody: ${bodyText}`,
        encoding_format: "float",
      });

      embedding = embeddingResponse.data[0].embedding;
      console.log(`[AI Triage] Vector embedding generated!`);
    } catch (aiError) {
      console.error("[AI Triage] OpenAI classification failed, falling back to defaults:", aiError);
    }

    // 3. Store the enriched email in Postgres using Drizzle
    await db.insert(emails).values({
      id: messageId,
      userId: tenantId,
      threadId: messageId,
      subject,
      fromAddress,
      toAddress,
      snippet: summary,
      body: bodyText,
      priority,
      embedding: embedding as any,
      date: dateStr ? new Date(dateStr) : new Date(),
      labels: labels || [],
    }).onConflictDoUpdate({
      target: emails.id,
      set: {
        priority,
        snippet: summary,
        ...(embedding ? { embedding: embedding as any } : {}),
        labels: labels || [],
      }
    });

    console.log(`[AI Triage] Successfully saved enriched email to Postgres!`);

  } catch (error) {
    console.error("[AI Triage] Critical error saving email:", error);
  }
}
