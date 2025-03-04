import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/src/index";
import { paymentTable } from "@/src/db/schema/payment";
import { eq } from "drizzle-orm";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pidx = searchParams.get("pidx");
  const transactionId = searchParams.get("transaction_id");
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("purchase_order_id");
  const status = searchParams.get("status");

  try {
    // verify the payment with Khalti
    const verificationResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      {
        pidx,
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    // update the payment record
    await db
      .update(paymentTable)
      .set({
        transactionId,
        status: verificationResponse.data.status, // update payment status
        paymentDetails: JSON.stringify(verificationResponse.data), // Store raw response
      })
      .where(eq(paymentTable.pidx, pidx));

    if (verificationResponse.data.status === "Completed") {
      return NextResponse.redirect("http://localhost:3000/payment-success"); // redirect to success page
    } else {
      return NextResponse.redirect("http://localhost:3000/payment-failure"); // redirect to failure page
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.redirect("http://localhost:3000/payment-failure"); // redirect to failure page
  }
}