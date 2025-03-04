import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { paymentTable } from "@/src/db/schema/payment";
import { eq } from "drizzle-orm";

// fetch payment details for a specific order
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // extract the orderId from the URL
    const url = new URL(request.url);
    const orderId = url.pathname.split("/").pop();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // fetch payment details for the given order ID
    const payment = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, parseInt(orderId, 10)));

    if (!payment || payment.length === 0) {
      return NextResponse.json(
        { error: "Payment details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// update payment status (used only if payment method is "Other")
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // update the payment status
    const [updatedPayment] = await db
      .update(paymentTable)
      .set({ status })
      .where(eq(paymentTable.orderId, parseInt(orderId, 10)))
      .returning();

    if (!updatedPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}