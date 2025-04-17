import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { salesTable } from "@/src/db/schema/sales";
import { productTable } from "@/src/db/schema/product";
import { eq } from "drizzle-orm";

// fetch sales data
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // fetch all sales for the current business
    const sales = await db
    .select({
        ...salesTable, // select all fields from sales table
      productName: productTable.productName,
      unitPrice: productTable.unitPrice,
    })
    .from(salesTable)
    .innerJoin(productTable, eq(salesTable.productId, productTable.id))
    .where(eq(salesTable.businessId, session.user.businessId));

    // return the sales data as JSON
    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return NextResponse.json(
      { error: "Error fetching sales data" },
      { status: 500 });

  }
}