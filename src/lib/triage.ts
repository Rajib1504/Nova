import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { db } from "../db";
import { emails } from "../db/schema";

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
  bodyText: string
) {
  try {
    console.log(`[AI Triage] Starting triage for email: ${subject}`);

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
    console.log(`[AI Triage] Classification complete: ${triageResult?.priority}`);

    // 2. Generate Vector Embedding for fast Cmd+K search
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `Subject: ${subject}\nBody: ${bodyText}`,
      encoding_format: "float",
    });

    const embedding = embeddingResponse.data[0].embedding;
    console.log(`[AI Triage] Vector embedding generated!`);

    // 3. Store the enriched email in Postgres using Drizzle
    
    // First, ensure the User exists in the database to satisfy the Foreign Key constraint!
    const { users } = await import("../db/schema");
    await db.insert(users).values({
      id: tenantId,
      email: `${tenantId}@nova.dev`, // Placeholder email to satisfy the unique constraint
      name: tenantId,
    }).onConflictDoNothing();

    await db.insert(emails).values({
      id: messageId,
      userId: tenantId,
      threadId: messageId,
      subject,
      fromAddress,
      toAddress,
      snippet: triageResult?.summary || "",
      body: bodyText,
      priority: triageResult?.priority || "Other",
      embedding: embedding,
      date: new Date(),
    }).onConflictDoUpdate({
      target: emails.id,
      set: {
        priority: triageResult?.priority,
        snippet: triageResult?.summary,
        embedding: embedding,
      }
    });

    console.log(`[AI Triage] Successfully saved enriched email to Postgres!`);

  } catch (error) {
    console.error("[AI Triage] Error triaging email:", error);
  }
}
