import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

// Ensure SECRET_KEY is defined
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

export async function PUT(request: NextRequest) {
  const { token, newPassword } = await request.json();

  try {
    // Validate the token and ensure it has the correct type
    const decoded = jwt.verify(token, SECRET_KEY as string) as jwt.JwtPayload;
    const email = decoded?.email;

    if (!email) {
      return NextResponse.json({ error: "Token does not contain an email address." }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.profiles.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({ message: "Password updated successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
  }
}
