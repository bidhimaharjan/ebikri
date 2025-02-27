import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { businessTable } from "@/src/db/schema/business";
import { eq } from "drizzle-orm";

// handle GET request to fetch the business name based on user ID
export async function GET(req) {
  try {
    // extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // get 'userId' parameter from the reques

    // if userId is missing
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const business = await db
      .select({ name: businessTable.businessName }) // select only the businessName field
      .from(businessTable)
      .where(eq(businessTable.userId, Number(userId))) // filter by userId
      .limit(1);

    // return the business name if found, otherwise return null
    return NextResponse.json(
      business.length > 0 ? { name: business[0].name } : { name: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching business name:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
