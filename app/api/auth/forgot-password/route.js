import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { passwordResetTokensTable } from "@/src/db/schema/password_reset_tokens";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export async function POST(request) {
  const { email } = await request.json();

  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      // Return success even if user doesn't exist (security measure)
      return NextResponse.json(
        { message: "If this email exists, we've sent a reset link" },
        { status: 200 }
      );
    }

    // Delete any existing tokens for this user
    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.userId, user.id));

    // Create new reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    await db.insert(passwordResetTokensTable).values({
      id: uuidv4(),
      userId: user.id,
      token,
      expiresAt,
    });

    // Send email with reset link using Mailtrap
    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    
    const mailOptions = {
      from: '"Your App Name" <no-reply@yourdomain.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #6b46c1; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #718096;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "If this email exists, we've sent a reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}