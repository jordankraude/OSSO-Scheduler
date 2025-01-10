import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstname?: string | null;
      lastname?: string | null;
      isAdmin?: boolean;
      isVolunteerDirector?: boolean;
    };
  }

  interface User {
    firstname?: string | null;
    lastname?: string | null;
    isAdmin?: boolean;
    isVolunteerDirector?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstname?: string | null;
    lastname?: string | null;
    isAdmin?: boolean;
    isVolunteerDirector?: boolean;
  }
}
