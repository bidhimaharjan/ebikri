import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { orderProductTable } from "@/src/db/schema/orderproduct";
import { paymentTable } from "@/src/db/schema/payment";
import { eq } from "drizzle-orm";

// delete an order
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const orderId = params.id;
    console.log("Deleting Order with ID:", orderId);

    // delete associated payment records
    await db.delete(paymentTable).where(eq(paymentTable.orderId, orderId));

    // delete associated order products
    await db.delete(orderProductTable).where(eq(orderProductTable.orderId, orderId));

    // delete the order
    await db
    .delete(orderTable)
    .where(eq(orderTable.id, orderId));

    return new NextResponse(
      JSON.stringify({ message: "Order deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}