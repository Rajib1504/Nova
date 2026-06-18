import "dotenv/config";
import { db } from "../src/db";
import { users, emails, calendarEvents } from "../src/db/schema";

async function main() {
  console.log("Wiping calendar data...");
  await db.delete(calendarEvents);
  
  console.log("Wiping gmail data...");
  await db.delete(emails);
  
  console.log("Wiping user/auth data...");
  await db.delete(users);

  console.log("Wipe complete!");
  process.exit(0);
}

main().catch(console.error);
