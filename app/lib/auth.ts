import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserService } from "../services/UserService";

export const authOptions: NextAuthOptions = {
  providers: [    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const userService = new UserService();
          
          // Authenticate user with password verification
          const user = await userService.authenticate(credentials.email, credentials.password);
          
          if (user) {
            return {
              id: user.id.toString(),
              name: user.username,
              email: user.email,
              role: user.role,
            };
          }
          
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          // Authentication failed
          return null;
        }
      },
    }),
  ],
  callbacks: {    async jwt({ token, user }) {
      // Add role to token if it exists on the user
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },async session({ session, token }) {
      // Add role to session from token
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};

// Extend the session and jwt types
declare module "next-auth" {
  interface User {
    role?: string;
    id?: string;
    email?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    email?: string;
  }
}
