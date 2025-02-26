import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { customerTable } from '@/src/db/schema/customer';
import { eq } from 'drizzle-orm';

// update existing customer data
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const id = params.id;
    console.log("Updating Customer with ID:", id);

    const body = await request.json();
    const { name, phoneNumber, email } = body;

    // validate input fields
    if (!name || !phoneNumber || !email) {
      return new NextResponse(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
      });
    }

    const [updatedCustomer] = await db
      .update(customerTable)
      .set({
        name,
        phoneNumber,
        email,
      })
      .where(eq(customerTable.id, id))
      .returning();

    return new NextResponse(JSON.stringify({ message: 'Customer updated successfully', customer: updatedCustomer }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}

// delete a customer data
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const id = params.id;
    console.log("Deleting Customer with ID:", id);

    await db
      .delete(customerTable)
      .where(eq(customerTable.id, id));

    return new NextResponse(JSON.stringify({ message: 'Customer deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}