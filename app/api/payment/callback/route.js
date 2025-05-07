import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/src/index";
import { paymentTable } from "@/src/db/schema/payment";
import { orderTable } from "@/src/db/schema/order";
import { paymentSecretsTable } from "@/src/db/schema/payment_secret"
import { eq, and } from "drizzle-orm";

// constants for redirecting the user
const SUCCESS_REDIRECT = "http://localhost:3000/payment-success";
const FAILURE_REDIRECT = "http://localhost:3000/payment-failure";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pidx = searchParams.get("pidx");
  
  // debug log for incoming request
  console.log("Payment callback received with pidx:", pidx);

  // validate required parameters
  if (!pidx) {
    console.error("Missing required parameter: pidx");
    return NextResponse.redirect(FAILURE_REDIRECT);
  }

  try {
    // first check if we already have a completed payment for this pidx
    const [existingPayment] = await db
      .select()
      .from(paymentTable)
      .where(
        and(
          eq(paymentTable.pidx, pidx),
          eq(paymentTable.status, "paid")
        )
      );

    if (existingPayment) {
      console.log("Payment already marked as completed, redirecting to success");
      return NextResponse.redirect(SUCCESS_REDIRECT);
    }

    // fetch the payment record using pidx
    const [payment] = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.pidx, pidx));

    if (!payment) {
      console.error("Payment record not found for pidx:", pidx);
      return NextResponse.redirect(FAILURE_REDIRECT);
    }

    // fetch the order to get businessId
    const [order] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, payment.orderId));

    if (!order) {
      console.error("Order not found for payment:", payment);
      return NextResponse.redirect(FAILURE_REDIRECT);
    }

    const businessId = order.businessId;

    // fetch the user's Khalti secret key from database
    const [paymentSecret] = await db
      .select()
      .from(paymentSecretsTable)
      .where(
        and(
          eq(paymentSecretsTable.businessId, businessId),
          eq(paymentSecretsTable.paymentProvider, "Khalti")
        )
      );

    if (!paymentSecret?.liveSecretKey) {
      console.error("Khalti payment credentials not configured for business:", businessId);
      return NextResponse.redirect(FAILURE_REDIRECT);
    }

    // verify payment with Khalti API
    const verificationResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${paymentSecret.liveSecretKey}`,
        },
      }
    );

    // validate Khalti response
    if (!verificationResponse.data?.status) {
      console.error("Invalid response from Khalti API:", verificationResponse.data);
      return NextResponse.redirect(FAILURE_REDIRECT);
    }

    // // log Khalti's verification response
    // console.log("Khalti Verification Response:", verificationResponse.data);

    // console.log("Received PIDX in Callback:", pidx);

    // map Khalti's status to our schema
    const khaltiStatus = verificationResponse.data.status;
    let mappedStatus;

    switch (khaltiStatus) {
      case "Completed":
        mappedStatus = "paid";
        break;
      case "Pending":
        mappedStatus = "pending";
        break;
      case "Failed":
        mappedStatus = "failed";
        break;
      default:
        mappedStatus = "failed"; // default to "failed" for unknown statuses
    }

    // prepare the data for the database update
    const paymentData = {
      transactionId: verificationResponse.data.transaction_id || null, // use null if transactionId is missing
      status: mappedStatus, // use the mapped status
      paymentDetails: JSON.stringify(verificationResponse.data), // store Khalti response
      paymentDate: new Date().toISOString(), // current date as the payment date
    };

    // update payment record in the database
    try {
      await db
        .update(paymentTable)
        .set(paymentData)
        .where(eq(paymentTable.pidx, pidx));

      console.log("Payment record updated successfully.");
    } catch (error) {
      console.error("Error updating payment record:", error);
      throw error;
    }

    // log the payment details
    console.log("Payment Details:", {
      pidx,
      paymentData,
    });

    // redirect the user based on payment status
    if (mappedStatus === "paid") {
      return NextResponse.redirect(SUCCESS_REDIRECT);
    } else {
      return NextResponse.redirect(FAILURE_REDIRECT);
    }
  } catch (error) {
    console.error("Error handling payment callback:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.redirect(FAILURE_REDIRECT);
  }
}