import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: (profile) => {
        return {
          id: profile.id,
          email: profile.email,
          firstname: profile.given_name || null,
          lastname: profile.family_name || null,
          image: profile.picture || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Ensure user.email is valid before using it in the database query
        const email = user.email ?? undefined; // Convert null to undefined for Prisma compatibility
    
        // Fetch user details from the database
        const dbUser = email
          ? await prisma.profiles.findUnique({
              where: { email }, // Use the validated email
              select: { isAdmin: true, isVolunteerDirector: true },
            })
          : null;
    
        // Attach additional properties to the token
        token.firstname = user.firstname || null;
        token.lastname = user.lastname || null;
        token.isAdmin = dbUser?.isAdmin || false;
        token.isVolunteerDirector = dbUser?.isVolunteerDirector || false;
      }
    
      return token as JWT & {
        firstname: string | null;
        lastname: string | null;
        isAdmin: boolean;
        isVolunteerDirector: boolean;
      };
    },
    
    async session({ session, token }) {
      session.user = {
        ...session.user, // Preserve default fields (e.g., email, name, image)
        firstname: token.firstname || null,
        lastname: token.lastname || null,
        isAdmin: token.isAdmin || false,
        isVolunteerDirector: token.isVolunteerDirector || false,
      };

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
