import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { salesTable } from "@/src/db/schema/sales";
import { productTable } from "@/src/db/schema/product";
import { eq } from "drizzle-orm";
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    let businessId;
    const authHeader = req.headers.get('authorization');  // get the authorization header from the incoming request

    // check for mobile JWT token first
    if (authHeader && authHeader.startsWith('Bearer ')) { // from mobile app
      const token = authHeader.split(' ')[1];  // extract the token from the header
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);  // verify the token
        businessId = decoded.businessId;
      } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    } 
    // fall back to NextAuth session for web requests
    else {
      const session = await getServerSession(authOptions);
      // check if the user is authenticated using NextAuth
      if (!session?.user?.businessId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      businessId = session.user.businessId;
    }

    // fetch all sales for the current business
    const sales = await db
      .select({
        ...salesTable, // select all fields from sales table
        productName: productTable.productName,
        unitPrice: productTable.unitPrice,
      })
      .from(salesTable)
      .innerJoin(productTable, eq(salesTable.productId, productTable.id))
      .where(eq(salesTable.businessId, businessId));

    // return the sales data as JSON
    return NextResponse.json(sales, { status: 200 });

  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Error fetching sales data" },
      { status: 500 }
    );
  }
}
