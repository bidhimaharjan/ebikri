import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { name, phoneNumber, email, password, businessName, businessType, businessEmail,  panNumber } = await req.json();
    
    // log the received data for debugging
    console.log('Received data:', { name, phoneNumber, email, password, businessName, businessType, businessEmail,  panNumber });

    // validate required fields
    if (!name || !phoneNumber || !email || !password || !businessName || !businessType) {
      return new NextResponse(JSON.stringify({ error: 'Fields with * are required' }), { status: 400 });
    }

    // check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    if (existingUser.length > 0) {
      return new NextResponse(JSON.stringify({ error: 'User already exists. Try with a new email.' }), { status: 400 });
    }

    // hash password
    const hashedPassword = await hash(password, 10);

    // insert new user and get the inserted ID using .returning
    const [newUser] = await db.insert(usersTable).values({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    }).returning();

    // check if newUser is valid and contains the userId
    if (newUser && newUser.id) {
      await db.insert(businessTable).values({
        userId: newUser.id,
        businessName,
        businessType,
        businessEmail,
        panNumber
      });
    } else {
      console.error("Failed to create user, userId is missing.");
      return new NextResponse(JSON.stringify({ error: 'Failed to register user' }), { status: 500 });
    }

    return new NextResponse(JSON.stringify({ message: 'User and business registered successfully' }), { status: 201 });
  } catch (error) {
    // log the error for debugging
    console.error('Error registering user:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
