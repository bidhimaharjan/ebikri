import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { customerTable } from "@/src/db/schema/customer";
import { eq, and } from "drizzle-orm";

// fetch customer data
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // fetch customers for the current business
    const customers = await db
      .select()
      .from(customerTable)
      .where(eq(customerTable.businessId, session.user.businessId));

    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// add new customer data
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, phoneNumber, email } = body;

    // validate input fields
    if (!name || !phoneNumber || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // check if customer already exists
    const [existingCustomer] = await db
      .select()
      .from(customerTable)
      .where(
        and(
          eq(customerTable.phoneNumber, phoneNumber),
          eq(customerTable.email, email),
          eq(customerTable.businessId, session.user.businessId)
        )
      );

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 }
      );
    }

    // insert new customer
    const [newCustomer] = await db
      .insert(customerTable)
      .values({
        businessId: session.user.businessId,
        name,
        phoneNumber,
        email,
        addedDate: new Date(),
        totalOrders: 0,
      })
      .returning();

    // return a success message with the added customer
    return NextResponse.json(
      { message: "Customer added successfully", customer: newCustomer },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding customer:", error);
    return NextResponse.json(
      { message: "Error adding customer", error: error.message },
      { status: 500 }
    );
  }
}
