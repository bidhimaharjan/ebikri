import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { productTable } from '@/src/db/schema/product';
import { eq } from 'drizzle-orm';

// fetch product data
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    // ensure businessId is being passed correctly from the session
    const inventory = await db
      .select()
      .from(productTable)
      .where(eq(productTable.businessId, session.user.businessId));

    // console.log(inventory);
    return new NextResponse(JSON.stringify(inventory), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

// add new product data
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
    const { productName, stockAvailability, unitPrice } = body;

    // validate input fields
    if (!productName || !stockAvailability || !unitPrice) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newProduct] = await db.insert(productTable).values({
      businessId: session.user.businessId,
      productName,
      stockAvailability,
      unitPrice,
    }).returning();

    // return a success message with the added product
    return NextResponse.json(
      { message: 'Product added successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { message: 'Error adding product', error: error.message },
      { status: 500 }
    );
  }
}