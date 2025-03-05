import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { orderProductTable } from "@/src/db/schema/orderproduct";
import { paymentTable } from "@/src/db/schema/payment";
import { customerTable } from "@/src/db/schema/customer";
import { eq } from "drizzle-orm";

// fetch order details by ID
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = params.id;
    console.log("Fetching Order with ID:", orderId);

    // Fetch the order
    const order = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch the customer details
    const customer = await db
      .select()
      .from(customerTable)
      .where(eq(customerTable.id, order[0].customerId))
      .limit(1);

    if (!customer || customer.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch the products associated with the order
    const products = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    // Fetch the payment status associated with the order
    const payment = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, orderId));

    console.log("Payment:", payment);

    // handle cases where no payment record exists
    const paymentStatus = payment.length > 0 ? payment[0].status : "pending";

    // Create the response
    const response = {
      id: order[0].id,
      customer: {
        id: customer[0].id,
        name: customer[0].name,
        email: customer[0].email,
        phoneNumber: customer[0].phoneNumber,
      },
      products: products.map((product) => ({
        productId: product.productId,
        quantity: product.quantity,
      })),
      deliveryLocation: order[0].deliveryLocation,
      totalAmount: order[0].totalAmount,
      paymentStatus: paymentStatus, // Include the payment status in the response
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// update an order
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = params.id;
    const { products, deliveryLocation } = await request.json();

    console.log("Updating Order with ID:", orderId);

    // Validate input
    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid products data" }, { status: 400 });
    }

    if (!deliveryLocation || typeof deliveryLocation !== "string") {
      return NextResponse.json({ error: "Invalid delivery location" }, { status: 400 });
    }

    // update the order's delivery location
    await db
      .update(orderTable)
      .set({ deliveryLocation })
      .where(eq(orderTable.id, orderId));

    // delete existing order products
    await db.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

    // insert updated products
    for (const product of products) {
      await db.insert(orderProductTable).values({
        orderId,
        productId: product.productId,
        quantity: product.quantity,
      });
    }

    return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// delete an order
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = params.id;
    console.log("Deleting Order with ID:", orderId);

    // delete associated payment records
    await db.delete(paymentTable).where(eq(paymentTable.orderId, orderId));

    // delete associated order products
    await db.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

    // delete the order
    await db.delete(orderTable).where(eq(orderTable.id, orderId));

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
