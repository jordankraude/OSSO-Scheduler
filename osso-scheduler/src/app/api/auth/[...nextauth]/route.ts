import NextAuth, { NextAuthOptions } from "next-auth"; 
import CredentialsProvider from "next-auth/providers/credentials"; 
import { PrismaClient } from "@prisma/client"; 
import bcrypt from "bcryptjs"; 

const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "your-email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.profiles.findUnique({
          where: { email: credentials?.email },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            image: true,
            passwordHash: true,
            isAdmin: true, // Fetch isAdmin field from the database
            isVolunteerDirector: true,
          }
        });

        if (user && credentials?.password) {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (isPasswordValid) {
            return {
              id: user.id,
              email: user.email,
              firstname: user.firstName || null,
              lastname: user.lastName || null,
              image: user.image || null,
              isAdmin: user.isAdmin || false, // Ensure isAdmin is included
              isVolunteerDirector: user.isVolunteerDirector || false,
            };
          }
        }
        return null; // Invalid credentials
      }
    }),
  ],
  session: {
    strategy: "jwt", 
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.firstname = user.firstname; // Will be string or null
        token.lastname = user.lastname;   // Will be string or null
        token.image = user.image;         // Will be string or null
        token.isAdmin = user.isAdmin || false; // Include isAdmin in the token
        token.isVolunteerDirector = user.isVolunteerDirector || false;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.firstname = (token.firstname as string | null) || null; 
      session.user.lastname = (token.lastname as string | null) || null;   
      session.user.image = (token.image as string | null) || null; 
      session.user.isAdmin = (token.isAdmin as boolean) || false; // Include isAdmin in the session
      session.user.isVolunteerDirector = (token.isVolunteerDirector as boolean) || false;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
