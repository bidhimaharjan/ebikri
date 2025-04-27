import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

// handle POST request for mobile login
export async function POST(req) {
  try {
    // parse the incoming request body to extract email and password
    const { email, password } = await req.json();

    // find user in database
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // fetch the associated business details using userId
    const [business] = await db.select()
      .from(businessTable)
      .where(eq(businessTable.userId, user.id))
      .limit(1);

    // create JWT token containing userId, email, and businessId
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        businessId: business.id
      },
      process.env.NEXTAUTH_SECRET, // NextAuth secret key from .env
      { expiresIn: '7d' } // valid for 7 days
    );

    // return response with the token and basic user info
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
