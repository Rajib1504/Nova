import 'dotenv/config';
import { db } from './src/db/index.js';
import { corsairAccounts, corsairEntities, corsairEvents } from './src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

async function wipe() {
  console.log("Wiping accounts for user_104494786104283262460...");
  
  const accounts = await db.select({ id: corsairAccounts.id }).from(corsairAccounts)
    .where(eq(corsairAccounts.tenantId, "user_104494786104283262460"));
    
  if (accounts.length > 0) {
    const accountIds = accounts.map(a => a.id);
    
    await db.delete(corsairEvents).where(inArray(corsairEvents.accountId, accountIds));
    await db.delete(corsairEntities).where(inArray(corsairEntities.accountId, accountIds));
    
    const result = await db.delete(corsairAccounts)
      .where(inArray(corsairAccounts.id, accountIds))
      .returning();
      
    console.log(`Deleted ${result.length} connected accounts.`);
  } else {
    console.log("No accounts found.");
  }
  process.exit(0);
}

wipe();
