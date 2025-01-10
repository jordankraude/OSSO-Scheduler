// src/app/api/auth/signup/route.ts
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();

    // Check if any required fields are missing
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existingUser = await prisma.profiles.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Account already exists with this email" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.profiles.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName, // Store first name
        lastName,  // Store last name
      },
    });

    return NextResponse.json({ message: "Signup successful" }, { status: 200 });
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
