import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
const { v4: uuidv4 } = require('uuid');

export async function POST(req) {
  try {
    const data = await req.json();

    // check if user with the given email already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists. Try with a new email.' },
        { status: 400 }
      );      
    }

    // check for existing phone number
    const existingPhone = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phoneNumber, data.phoneNumber));

    if (existingPhone.length > 0) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // hash password before storing
    const hashedPassword = await hash(data.password, 10);

    // insert new user into usersTable and return the inserted record
    const [newUser] = await db.insert(usersTable).values({
      id: uuidv4(), // generate a unique uuid for the new user
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      password: hashedPassword, // store the hashed password
      emailVerified: null,
      image: null,
      provider: 'credentials',
      requiresProfileCompletion: false,
    }).returning();

    // check if newUser is valid and contains the userId
    if (newUser && newUser.id) {
      // insert associated business details into businessTable
      await db.insert(businessTable).values({
        userId: newUser.id, // link business to newly created user
        businessName: data.businessName,
        businessType: data.businessType,
        businessEmail: data.businessEmail,
        panNumber: data.panNumber
      });
    } else {
      console.error("Failed to create user, userId is missing.");
      return NextResponse.json(
        { error: 'Failed to register user' },
        { status: 500 }
      );      
    }

    return NextResponse.json(
      { message: 'User and business registered successfully' },
      { status: 201 }
    );    
  } catch (error) {
    // log the error for debugging
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );    
  }
}
