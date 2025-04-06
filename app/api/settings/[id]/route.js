import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { eq, and } from "drizzle-orm";

// fetch user settings data
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const id = Number(params.id);

    // verify user can only access their own data
    if (id !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    // fetch user data
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // fetch business data
    const [business] = await db
      .select()
      .from(businessTable)
      .where(eq(businessTable.userId, id));

    // remove sensitive fields before sending response
    const { password, ...safeUserData } = user;

    return new NextResponse(
      JSON.stringify({
        user: safeUserData,
        business: business || null,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}

// update user settings
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const id = Number(params.id);

    // verify user can only access their own data
    if (id !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const body = await request.json();
    const {
      personalInfo, // { name, email, phoneNumber }
      businessInfo, // { name, type, email, panNumber }
      passwordInfo, // { currentPassword, newPassword }
    } = body;

    // initialize transaction for multiple updates
    const results = await db.transaction(async (tx) => {
      const updates = {};

      // update personal info if provided
      if (personalInfo) {
        const [updatedUser] = await tx
          .update(usersTable)
          .set(personalInfo)
          .where(eq(usersTable.id, id))
          .returning();
        
        const { password, ...safeUserData } = updatedUser;
        updates.user = safeUserData;
      }

      // update business info if provided
      if (businessInfo) {
        const [updatedBusiness] = await tx
          .update(businessTable)
          .set(businessInfo)
          .where(eq(businessTable.userId, id))
          .returning();
        
        updates.business = updatedBusiness;
      }

      // update password if provided (with proper hashing in a real implementation)
      if (passwordInfo?.newPassword) {
        // In production: hash the password before storing
        await tx
          .update(usersTable)
          .set({ 
            password: passwordInfo.newPassword,
            updatedAt: new Date()
          })
          .where(eq(usersTable.id, id));
      }

      return updates;
    });

    return new NextResponse(
      JSON.stringify({
        message: "Settings updated successfully",
        ...results,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user settings:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}