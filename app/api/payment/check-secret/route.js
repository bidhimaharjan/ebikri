import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { paymentSecretsTable } from "@/src/db/schema/payment_secret";
import { and, eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // query to check if Khalti secret exists for this user
    const [secret] = await db
      .select()
      .from(paymentSecretsTable)
      .where(
        and(
          eq(paymentSecretsTable.userId, session.user.id),
          eq(paymentSecretsTable.paymentProvider, "Khalti")
        )
      );

    // respond with whether a liveSecretKey is present for the user
    return NextResponse.json(
      {
        hasSecret: !!secret?.liveSecretKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking payment secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
