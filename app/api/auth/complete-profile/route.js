import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { eq, and, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    phoneNumber,
    businessName,
    businessType,
    businessEmail,
    panNumber,
  } = await req.json();

  // Validate required fields
  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return NextResponse.json({ error: 'Valid 10-digit phone number is required' }, { status: 400 });
  }

  if (!businessName || !businessType) {
    return NextResponse.json({ error: 'Business name and type are required' }, { status: 400 });
  }

  try {
    // Check for phone number conflict
    const existingPhone = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.phoneNumber, phoneNumber), ne(usersTable.id, session.user.id)));

    if (existingPhone.length > 0) {
      return NextResponse.json({ error: 'Phone number already in use' }, { status: 400 });
    }

    // Check for existing business for this user
    const existingBusiness = await db
      .select()
      .from(businessTable)
      .where(eq(businessTable.userId, session.user.id))
      .limit(1);

    // Check for business email conflict (if provided)
    if (businessEmail) {
      const existingEmail = await db
        .select()
        .from(businessTable)
        .where(and(eq(businessTable.businessEmail, businessEmail), ne(businessTable.userId, session.user.id)));

      if (existingEmail.length > 0) {
        return NextResponse.json({ error: 'Business email already in use' }, { status: 400 });
      }
    }

    // Check for PAN number conflict (if provided)
    if (panNumber) {
      const existingPan = await db
        .select()
        .from(businessTable)
        .where(and(eq(businessTable.panNumber, panNumber), ne(businessTable.userId, session.user.id)));

      if (existingPan.length > 0) {
        return NextResponse.json({ error: 'PAN number already in use' }, { status: 400 });
      }
    }

    // Update user's phone number
    await db
      .update(usersTable)
      .set({ 
        phoneNumber,
        requiresProfileCompletion: false
      })
      .where(eq(usersTable.id, session.user.id));

    // Update existing business or insert if none
    if (existingBusiness.length > 0) {
      await db
        .update(businessTable)
        .set({
          businessName,
          businessType,
          businessEmail: businessEmail || null,
          panNumber: panNumber || null,
        })
        .where(eq(businessTable.userId, session.user.id));
    } else {
      await db.insert(businessTable).values({
        userId: session.user.id,
        businessName,
        businessType,
        businessEmail: businessEmail || null,
        panNumber: panNumber || null,
      });
    }


    // After successful updates, fetch the complete updated user
    const [updatedUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    return NextResponse.json({ 
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        requiresProfileCompletion: updatedUser.requiresProfileCompletion,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}