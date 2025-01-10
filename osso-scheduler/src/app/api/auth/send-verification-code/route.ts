import { PrismaClient } from "@prisma/client"; 
import { NextResponse, NextRequest } from 'next/server';
import nodemailer from 'nodemailer'; 
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Check if the email exists in your database
  const user = await prisma.profiles.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  // Generate a verification code and expiration time (e.g., 10 minutes from now)
  const code = uuidv4();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store the verification code in the database
  await prisma.verificationCode.upsert({
    where: { email },
    update: { code, expiresAt }, // Update if exists
    create: { email, code, expiresAt }, // Create if not exists
  });

  // Send the verification code via email
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Example for Gmail
    auth: {
      user: `${process.env.GMAIL}`,
      pass: `${process.env.GMAIL_PASSWORD}`,
    },
  });

  await transporter.sendMail({
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
  });

  return NextResponse.json({ message: "Verification code sent" });
}
