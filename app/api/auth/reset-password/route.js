import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { passwordResetTokensTable } from "@/src/db/schema/password_reset_tokens";
import { eq, and, gt } from "drizzle-orm";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token, password } = await request.json();

  try {
    // find valid token
    const [resetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.token, token),
          gt(passwordResetTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // hash new password
    const hashedPassword = await hash(password, 10);

    // update user password
    await db
      .update(usersTable)
      .set({ password: hashedPassword })
      .where(eq(usersTable.id, resetToken.userId));

    // delete used token
    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.id, resetToken.id));

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}