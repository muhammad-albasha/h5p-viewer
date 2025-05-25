import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { initializeDatabase } from "@/app/lib/db";

// Initialize the database when the auth API is first loaded
initializeDatabase().catch(console.error);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
