import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { inventoryTable } from '@/src/db/schema/inventory';
import { eq } from 'drizzle-orm';

// update existing product data
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const id = params.id;
    console.log("Updating Product with ID:", id);

    const body = await request.json();
    const { productName, stockAvailability, unitPrice } = body;

    // validate input fields
    if (!productName || !stockAvailability || !unitPrice) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const [updatedProduct] = await db
      .update(inventoryTable)
      .set({
        productName,
        stockAvailability,
        unitPrice,
      })
      .where(eq(inventoryTable.id, id))
      .returning();

    return new NextResponse(JSON.stringify({ message: 'Product updated successfully', product: updatedProduct }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}


// delete a product data
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const id = params.id;
    console.log("Deleting Product with ID:", id);

    await db
      .delete(inventoryTable)
      .where(eq(inventoryTable.id, id));

    return new NextResponse(JSON.stringify({ message: 'Product deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}