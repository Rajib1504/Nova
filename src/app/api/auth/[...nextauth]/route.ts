import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !user.id) {
        console.error("🚨 Login Failed: Missing user email or ID from Google.");
        return false;
      }

      try {
        // Upsert the user into your Drizzle Postgres database
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          name: user.name || "Unknown",
        }).onConflictDoUpdate({
          target: users.id,
          set: { email: user.email, name: user.name }
        });

        console.log("✅ User successfully saved to database!");
        return true;
      } catch (error) {
        // THIS IS THE FIX: We will now see exactly why it is crashing!
        console.error("🚨 DATABASE INSERT ERROR DURING LOGIN:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Attach the database ID to the session so Corsair can use it
        session.user.id = String(token.sub);
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };