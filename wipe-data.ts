import 'dotenv/config';
import { db } from './src/db/index.js';
import { emails, calendarEvents, users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function wipe() {
  const userId = "104494786104283262460";
  console.log(`Wiping emails and events for user ${userId}...`);
  
  const emailRes = await db.delete(emails).where(eq(emails.userId, userId)).returning();
  const calRes = await db.delete(calendarEvents).where(eq(calendarEvents.userId, userId)).returning();
  
  console.log(`Deleted ${emailRes.length} emails and ${calRes.length} calendar events.`);
  process.exit(0);
}

wipe();
