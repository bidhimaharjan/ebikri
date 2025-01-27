// import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { businessName, businessType, email, phoneNumber, panNumber, password } = await req.json();
    
    // Log the received data for debugging
    console.log('Received data:', { businessName, businessType, email, phoneNumber, panNumber, password });

    // Validate input
    if (!businessName || !businessType || !email || !phoneNumber || !panNumber || !password) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ error: 'User already exists' }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Insert new user into the database
    await db.insert(usersTable).values({
      businessName,
      businessType,
      email,
      phoneNumber,
      panNumber,
      password: hashedPassword,
    });

    return new Response(JSON.stringify({ message: 'User registered successfully' }), { status: 201 });
  } catch (error) {
    // Log the error for debugging
    console.error('Error registering user:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
