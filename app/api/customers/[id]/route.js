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
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    console.log("Updating Customer with ID:", id);

    const body = await request.json();
    const { name, phoneNumber, email } = body;

    // validate input fields
    if (!name || !phoneNumber || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
      
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

      return NextResponse.json(
        { message: 'Customer updated successfully', customer: updatedCustomer },
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

// delete a customer data
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
    console.log("Deleting Customer with ID:", id);

    await db
      .delete(customerTable)
      .where(eq(customerTable.id, id));

      return NextResponse.json(
        { message: 'Customer deleted successfully' },
        { status: 200 }
      );      
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}