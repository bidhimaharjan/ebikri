import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { eq } from "drizzle-orm";

export async function GET(request, { params }) {
  const { orderId } = params;

  try {
    // Fetch the order details
    const [order] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId));

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // generate Khalti payment link
    const khaltiResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: "http://localhost:3000/api/payment/callback",
        website_url: "http://localhost:3000",
        amount: order.totalAmount * 100, // amount in paisa
        purchase_order_id: order.id, // use the order ID as the purchase order ID
        purchase_order_name: `Order #${order.id}`,
        customer_info: {
          name: order.customerName,
          email: order.email,
          phone: order.phoneNumber,
        },
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    // return the Khalti payment URL
    return NextResponse.json({
      payment_url: khaltiResponse.data.payment_url,
    });
  } catch (error) {
    console.error("Error generating Khalti payment link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}