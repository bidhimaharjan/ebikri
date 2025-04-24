import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { orderTable } from "@/src/db/schema/order";
import { customerTable } from "@/src/db/schema/customer";
import { eq, sum, count } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    let businessId;
    const authHeader = req.headers.get('authorization');
    
    // Check for mobile JWT token first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        businessId = decoded.businessId;
      } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } 
    // Fall back to NextAuth session for web
    else {
      const session = await getServerSession(authOptions);
      if (!session?.user?.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      businessId = session.user.businessId;
    }

    // fetch revenue
    const revenueResult = await db
      .select({ revenue: sum(orderTable.totalAmount) })
      .from(orderTable)
      .where(eq(orderTable.businessId, businessId));

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

    // return the fetched data
    return NextResponse.json({
      revenue,
      totalOrders,
      totalCustomers,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
