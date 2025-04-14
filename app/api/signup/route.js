import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { hash } from 'bcrypt';
import { eq } from 'drizzle-orm';
import { validateServerSignup } from '@/app/validation/signup';

export async function POST(req) {
  try {
    const data = await req.json();   
    // validate using server validation
    const errors = validateServerSignup(data);
  
    if (Object.keys(errors).length > 0) {
      // return the first error message
      return NextResponse.json(
        { error: Object.values(errors)[0] },
        { status: 400 }
      );
    }

    // check if user already exists
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

    // hash password
    const hashedPassword = await hash(data.password, 10);

    // insert new user and get the inserted ID using .returning
    const [newUser] = await db.insert(usersTable).values({
      name: data.name,
      phoneNumber: data.phoneNumber,
      email: data.email,
      password: hashedPassword,
    }).returning();

    // check if newUser is valid and contains the userId
    if (newUser && newUser.id) {
      await db.insert(businessTable).values({
        userId: newUser.id,
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
