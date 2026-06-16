import { corsair } from "./corsair";

async function test() {
  try {
    const c = corsair.withTenant("user_104494786104283262460");
    console.log("googlecalendar keys:", Object.keys(c.googlecalendar || {}));
    if (c.googlecalendar?.api) {
      console.log("api keys:", Object.keys(c.googlecalendar.api || {}));
      if (c.googlecalendar.api.events) {
        console.log("events keys:", Object.keys(c.googlecalendar.api.events || {}));
      }
    }
  } catch (e) {
    console.error(e);
  }
}
test();
