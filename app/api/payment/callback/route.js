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
    // // log the received query parameters
    // console.log("Received Payment Callback:", {
    //   pidx,
    //   transactionId,
    //   amount,
    //   orderId,
    //   status,
    // });

    // verify payment with Khalti API
    const verificationResponse = await axios.post(
      "https://dev.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    // // log Khalti's verification response
    // console.log("Khalti Verification Response:", verificationResponse.data);

    // console.log("Received PIDX in Callback:", pidx);

    // fetch the payment record from the database
    const [payment] = await db
      .select()
      .from(paymentTable)
      .where(eq(paymentTable.pidx, pidx));

    if (!payment) {
      console.error("Payment record not found for PIDX:", pidx);
      return NextResponse.redirect("http://localhost:3000/payment-failure");
    }

    // map Khalti's status to the schema's allowed values
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
      transactionId: transactionId || null, // use null if transactionId is missing
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
      transactionId,
      amount,
      orderId,
      status: mappedStatus, // Use the mapped status
      verificationResponse: verificationResponse.data,
    });

    // redirect the user based on payment status
    if (mappedStatus === "paid") {
      return NextResponse.redirect("http://localhost:3000/payment-success");
    } else {
      return NextResponse.redirect("http://localhost:3000/payment-failure");
    }
  } catch (error) {
    console.error("Error handling payment callback:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });
    return NextResponse.redirect("http://localhost:3000/payment-failure");
  }
}