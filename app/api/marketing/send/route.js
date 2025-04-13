import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { marketingTable } from "@/src/db/schema/marketing";
import { customerTable } from "@/src/db/schema/customer";
import { eq, and } from "drizzle-orm";
import { sendCampaignEmail } from "@/lib/email";

// helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { campaignId } = await request.json();

    // fetch business name using businessname API
    const businessNameResponse = await fetch(
      `${process.env.NEXTAUTH_URL}/api/businessname?userId=${session.user.id}`
    );
    const businessData = await businessNameResponse.json();
    const businessName = businessData.name || "eBikri";

    // get campaign details
    const [campaign] = await db
      .select()
      .from(marketingTable)
      .where(
        and(
          eq(marketingTable.id, campaignId),
          eq(marketingTable.businessId, session.user.businessId)
        )
      );

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 }
      );
    }

    // get customers
    let customers;
    if (campaign.recipients === "all") {
      customers = await db
        .select()
        .from(customerTable)
        .where(eq(customerTable.businessId, session.user.businessId));
    } else {
      return NextResponse.json(
        { message: "Selected recipients functionality not implemented yet" },
        { status: 400 }
      );
    }

    // prepare email content
    const emailSubject = `Special Offer: ${campaign.campaignName}`;
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    // send emails with rate limiting
    for (const customer of customers) {
      try {
        const emailHtml = generateEmailHtml(customer, campaign, businessName);
        await sendCampaignEmail(
          customer.email,
          emailSubject,
          emailHtml,
          businessName
        );
        results.sent++;

        // add delay between emails to avoid rate limiting
        if (results.sent % 5 === 0) {
          await delay(1000); // 1 second delay every 5 emails
        }
      } catch (error) {
        console.error(`Failed to send to ${customer.email}:`, error);
        results.failed++;
        results.errors.push({
          email: customer.email,
          error: error.message,
        });

        // if we get rate limited, wait longer
        if (
          error.responseCode === 550 &&
          error.response.includes("Too many emails")
        ) {
          await delay(5000); // wait 5 seconds if rate limited
        }
      }
    }

    return NextResponse.json({
      message: "Email sending completed",
      ...results,
    });
  } catch (error) {
    console.error("Error in send route:", error);
    return NextResponse.json(
      { message: "Error processing request", error: error.message },
      { status: 500 }
    );
  }
}

function generateEmailHtml(customer, campaign, businessName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">${campaign.campaignName}</h1>
      <p>Hi ${customer.name},</p>
      <p>${businessName} is excited to offer you ${
    campaign.discountPercent
  }% off your next purchase!</p>
      <div style="background-color: #f0f9ff; border: 1px dashed #2563eb; padding: 15px; margin: 15px 0; text-align: center;">
        <p style="font-size: 18px; font-weight: bold;">Use promo code: ${
          campaign.promoCode
        }</p>
      </div>
      <p>This offer is valid from ${new Date(
        campaign.startDate
      ).toLocaleDateString()} to ${new Date(
    campaign.endDate
  ).toLocaleDateString()}. Don't miss out on this exclusive offer!</p>
      <p>Thank you for being a valued customer!</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
        © ${new Date().getFullYear()} ${businessName}. All rights reserved.<br>
        <a href="#" style="color: #2563eb;">Unsubscribe</a>
      </p>
    </div>
  `;
}
