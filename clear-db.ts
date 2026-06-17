import 'dotenv/config';
import { db } from "./src/db";
import { calendarEvents, emails, corsairAccounts, corsairEntities, corsairEvents, corsairIntegrations } from "./src/db/schema";
import { inArray } from "drizzle-orm";

async function clearData() {
  try {
    console.log("Clearing calendar events data...");
    await db.delete(calendarEvents);
    
    console.log("Clearing emails data...");
    await db.delete(emails);

    console.log("Finding gmail and googlecalendar integrations...");
    const integrations = await db.query.corsairIntegrations.findMany({
      where: inArray(corsairIntegrations.name, ["gmail", "googlecalendar"])
    });

    const integrationIds = integrations.map(i => i.id);

    if (integrationIds.length > 0) {
      console.log("Finding associated accounts...");
      const accounts = await db.query.corsairAccounts.findMany({
        where: inArray(corsairAccounts.integrationId, integrationIds)
      });
      
      const accountIds = accounts.map(a => a.id);
      
      if (accountIds.length > 0) {
        console.log("Clearing associated Corsair events...");
        await db.delete(corsairEvents).where(inArray(corsairEvents.accountId, accountIds));
        
        console.log("Clearing associated Corsair entities...");
        await db.delete(corsairEntities).where(inArray(corsairEntities.accountId, accountIds));
        
        console.log("Clearing Corsair accounts...");
        await db.delete(corsairAccounts).where(inArray(corsairAccounts.id, accountIds));
      }
    }
    
    console.log("✅ Google Calendar and Gmail data cleared successfully! You can now test a fresh login.");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
  } finally {
    process.exit(0);
  }
}

clearData();
