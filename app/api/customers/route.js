import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/src/index";
import { customerTable } from "@/src/db/schema/customer";
import { eq } from "drizzle-orm";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Fetch customers for the current business
    const customers = await db
      .select()
      .from(customerTable)
      .where(eq(customerTable.businessId, session.user.businessId));

    return new Response(JSON.stringify(customers), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}