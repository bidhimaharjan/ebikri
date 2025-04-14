import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { productTable } from '@/src/db/schema/product';
import { eq } from 'drizzle-orm';

// update existing product data
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const body = await request.json();
    const { productName, stockAvailability, unitPrice } = body;

    // validate input fields
    if (!productName || !stockAvailability || !unitPrice) {
      return NextResponse.json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const [updatedProduct] = await db
      .update(productTable)
      .set({
        productName,
        stockAvailability,
        unitPrice,
      })
      .where(eq(productTable.id, id))
      .returning();

      return NextResponse.json(
        { message: 'Product updated successfully', product: updatedProduct },
        { status: 200 }
      );      
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );    
  }
}


// delete a product data
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" }, 
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    await db
      .delete(productTable)
      .where(eq(productTable.id, id));

      return NextResponse.json(
        { message: 'Product deleted successfully' },
        { status: 200 }
      );
      
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    
  }
}