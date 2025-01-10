import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not set in environment variables.");
}

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  // Retrieve the verification code from the database
  const verificationEntry = await prisma.verificationCode.findUnique({ where: { email } });

  // Check if the entry exists
  if (!verificationEntry) {
    return NextResponse.json({ error: "Verification code not found for this email." }, { status: 404 });
  }

  // Check if the provided code matches the stored code and if it's expired
  if (verificationEntry.code !== code) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  if (new Date() > new Date(verificationEntry.expiresAt)) {
    return NextResponse.json({ error: "Verification code has expired." }, { status: 400 });
  }

  // Generate a JWT token that includes the email
  const token = jwt.sign({ email }, SECRET_KEY as string, { expiresIn: '1h' }); // Token expires in 1 hour

  // Optionally delete the verification code after successful verification
  await prisma.verificationCode.delete({ where: { email } });

  return NextResponse.json({ message: "Verification successful! You can now reset your password.", token });
}
