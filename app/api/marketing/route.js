import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { marketingTable } from '@/src/db/schema/marketing';
import { eq } from 'drizzle-orm';

// fetch all marketing campaigns for a business
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const campaigns = await db
      .select()
      .from(marketingTable)
      .where(eq(marketingTable.businessId, session.user.businessId));

    console.log("Marketing Data from API:", campaigns);

    return new NextResponse(JSON.stringify(campaigns), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

// Create a new marketing campaign
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { 
      campaignName, 
      discountPercent, 
      promoCode, 
      recipients, 
      startDate, 
      endDate 
    } = body;

    // Validate required fields
    if (!campaignName || !discountPercent || !promoCode || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    const existingPromo = await db
      .select()
      .from(marketingTable)
      .where(eq(marketingTable.promoCode, promoCode))
      .limit(1);

    if (existingPromo.length > 0) {
      return NextResponse.json(
        { message: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Create new campaign
    const [newCampaign] = await db
      .insert(marketingTable)
      .values({
        businessId: session.user.businessId,
        campaignName,
        discountPercent,
        recipients,
        promoCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        active: new Date() >= new Date(startDate) && new Date() <= new Date(endDate)
      })
      .returning();

    return NextResponse.json(
      { message: 'Campaign created successfully', campaign: newCampaign },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { message: 'Error creating campaign', error: error.message },
      { status: 500 }
    );
  }
}