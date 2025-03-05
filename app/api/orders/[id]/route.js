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
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = id;
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

    // fetch the products associated with the order
    const products = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    // fetch the payment status associated with the order
    const payment = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.orderId, orderId));

    console.log("Payment:", payment);

    // handle cases where no payment record exists
    const paymentStatus = payment.length > 0 ? payment[0].status : "pending";

    // create the response
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
      paymentStatus: paymentStatus,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// update an order
export async function PUT(request, { params }) {
  const { id } = await params;
  
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = id;
    const { products, deliveryLocation } = await request.json();

    console.log("Updating Order with ID:", orderId);

    // validate input
    if (!deliveryLocation || typeof deliveryLocation !== "string") {
      return NextResponse.json({ error: "Invalid delivery location" }, { status: 400 });
    }

    // fetch existing products
    const existingProducts = await db
      .select()
      .from(orderProductTable)
      .where(eq(orderProductTable.orderId, orderId));

    const existingProductsMap = new Map(
      existingProducts.map((p) => [p.productId, p.quantity])
    );

    const newProductsMap = new Map(
      (products || []).map((p) => [p.productId, p.quantity])
    );

    // check if products have changed
    const productsChanged =
      existingProducts.length !== (products || []).length ||
      existingProducts.some((p) => newProductsMap.get(p.productId) !== p.quantity);

    // update only the delivery location if products haven't changed
    if (!productsChanged) {
      await db
        .update(orderTable)
        .set({ deliveryLocation })
        .where(eq(orderTable.id, orderId));
      return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
    }

    // // delete existing order products only if they have changed
    // await db.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

    // // insert updated products
    // for (const product of products || []) {
    //   // ensure `unitPrice` is provided in the request or use a default value
    //   if (!product.unitPrice) {
    //     throw new Error("Product unitPrice is required");
    //   }

    //   await db.insert(orderProductTable).values({
    //     orderId,
    //     productId: product.productId,
    //     quantity: product.quantity,
    //     unitPrice: product.unitPrice, // Add the unitPrice
    //   });
    // }

    // return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
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
