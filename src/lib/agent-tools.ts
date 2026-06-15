import { z } from "zod";
import { tool } from "@openai/agents";
import { db } from "../db";
import { emails } from "../db/schema";
import { headers } from "next/headers";

export const createStoreEmailTool = (tenantId: string) => tool({
  name: "store_email",
  description: "Store an email in the Nova database with priority and summary.",
  parameters: z.object({
    subject: z.string(),
    sender: z.string(),
    toAddress: z.string().optional(),
    snippet: z.string().describe("A very short, 1-sentence summary of the email."),
    body: z.string().describe("The main body text of the email."),
    priority: z.enum(["Important", "Newsletter", "Other", "urgent", "high", "normal"]).describe("The priority of the email based on its content and sender."),
    messageId: z.string(),
  }),
  execute: async (args) => {
    try {
      console.log("\n=== 🤖 AGENT EXECUTED: store_email ===");
      console.log("SUBJECT:", args.subject);
      
      const uniqueId = args.messageId && args.messageId.length > 5 ? args.messageId : Math.random().toString();

      // Insert into the real Postgres database with onConflictDoUpdate to prevent crashes on thread replies
      await db.insert(emails)
        .values({
          id: uniqueId,
          userId: tenantId,
          threadId: args.messageId || uniqueId,
          subject: args.subject,
          fromAddress: args.sender,
          toAddress: args.toAddress || "",
          snippet: args.snippet,
          body: args.body,
          date: new Date(),
          isRead: false,
          priority: args.priority.toLowerCase(),
          // We add INBOX so it naturally shows up in the user's Inbox UI
          labels: ["INBOX", "UNREAD"],
        })
        .onConflictDoUpdate({
          target: emails.id,
          set: {
            subject: args.subject,
            snippet: args.snippet,
            body: args.body,
            date: new Date(), // Update the date so it jumps to the top!
            isRead: false,
            priority: args.priority.toLowerCase(),
            labels: ["INBOX", "UNREAD"],
          }
        });

      console.log(`✅ Successfully saved/updated email from ${args.sender} into the database!`);
      console.log("=======================================\n");

      return { 
        success: true, 
        message: "Email successfully saved to the database!" 
      };
    } catch (e) {
      console.error("Failed to insert email:", e);
      return { success: false, error: String(e) };
    }
  }
});
