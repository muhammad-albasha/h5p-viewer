import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { initializeDatabase } from "@/app/lib/init";

// Initialize the database when the auth API is first loaded
initializeDatabase().catch(() => {
  // Database initialization failed silently
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
