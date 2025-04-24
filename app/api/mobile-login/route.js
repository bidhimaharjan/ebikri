import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    // Parse the incoming request body
    const { email, password } = await req.json();

    // Find user in database
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // fetch business details if needed
    const [business] = await db.select()
      .from(businessTable)
      .where(eq(businessTable.userId, user.id))
      .limit(1);

    // Create JWT token (valid for 7 days)
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        businessId: business.id
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessId: business.id
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
