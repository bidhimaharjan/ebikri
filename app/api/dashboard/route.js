import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { customerTable } from "@/src/db/schema/customer";
import { productTable } from "@/src/db/schema/product";
import { paymentTable } from "@/src/db/schema/payment";
import { marketingTable } from "@/src/db/schema/marketing";
import { eq, sum, count, sql, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    let businessId;
    const authHeader = req.headers.get('authorization'); // get the authorization header from the incoming request
    
    // check for mobile JWT token first
    if (authHeader && authHeader.startsWith('Bearer ')) { // from mobile app
      const token = authHeader.split(' ')[1]; // extract the token from the header
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET); // verify the token
        businessId = decoded.businessId;
      } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } 
    // fall back to NextAuth session for web requests
    else {
      // check if the user is authenticated using NextAuth
      const session = await getServerSession(authOptions);
      if (!session?.user?.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      businessId = session.user.businessId;
    }

    // fetch revenue from paid payments
    const revenueResult = await db
      .select({ revenue: sum(paymentTable.amount) })
      .from(paymentTable)
      .innerJoin(orderTable, eq(paymentTable.orderId, orderTable.id))
      .where(
        and(
          eq(orderTable.businessId, businessId),
          eq(paymentTable.status, 'paid')
        )
      );

    const revenue = revenueResult[0]?.revenue || 0;

    // fetch total orders
    const ordersResult = await db
    .select({ count: count().as("totalOrders") })
      .from(orderTable)
      .where(eq(orderTable.businessId, businessId));

    const totalOrders = ordersResult[0]?.count || 0;

    // fetch total customers
    const customersResult = await db
    .select({ count: count().as("totalCustomers") })
      .from(customerTable)
      .where(eq(customerTable.businessId, businessId));

    const totalCustomers = customersResult[0]?.count || 0;

    // fetch total orders
    const productsResult = await db
    .select({ count: count().as("totalProducts") })
      .from(productTable)
      .where(eq(productTable.businessId, businessId));

    const totalProducts = productsResult[0]?.count || 0;

    // fetch total pending payments and paid payments
    const paymentsResult = await db
      .select({
        totalPayments: count(paymentTable.id).as("totalPayments"),
        totalPendingPayments: sql`count(*) filter (where ${paymentTable.status} = 'pending')`.as("totalPendingPayments"),
        totalPaidPayments: sql`count(*) filter (where ${paymentTable.status} = 'paid')`.as("totalPaidPayments"),
      })
      .from(paymentTable)
      .innerJoin(orderTable, eq(paymentTable.orderId, orderTable.id))
      .where(eq(orderTable.businessId, businessId));

    const totalPendingPayments = paymentsResult[0]?.totalPendingPayments || 0;
    const totalPaidPayments = paymentsResult[0]?.totalPaidPayments || 0;

    // fetch active marketing campaigns
    const marketingResult = await db
    .select({
      id: marketingTable.id,
      name: marketingTable.campaignName,
      discount: marketingTable.discountPercent,
      promoCode: marketingTable.promoCode,
      startDate: marketingTable.startDate,
      endDate: marketingTable.endDate,
      recipients: marketingTable.recipients
    })
    .from(marketingTable)
    .where(
      and(
        eq(marketingTable.businessId, businessId),
        eq(marketingTable.active, true)
      )
    );

    const activeCampaigns = marketingResult.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      discount: Number(campaign.discount),
      promoCode: campaign.promoCode,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      recipients: campaign.recipients
    }))

    // return the fetched data
    return NextResponse.json({
      revenue,
      totalOrders,
      totalCustomers,
      // for mobile version
      totalProducts,
      totalPendingPayments,
      totalPaidPayments,
      activeCampaigns
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
