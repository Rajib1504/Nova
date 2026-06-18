import 'dotenv/config';
import { db } from './src/db/index.js';
import { emails, calendarEvents, users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

async function wipe() {
  console.log(`Wiping all emails and calendar events from the database...`);
  
  const emailRes = await db.delete(emails).returning();
  const calRes = await db.delete(calendarEvents).returning();
  
  console.log(`Deleted ${emailRes.length} emails and ${calRes.length} calendar events.`);
  process.exit(0);
}

wipe();
