import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcrypt";

// fetch user and business data
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

// update user data, business data, and password
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
      businessInfo, // { businessName, businessType, businessEmail, panNumber }
      passwordInfo, // { currentPassword, newPassword }
    } = body;

    // get current user data to verify current password if changing password
    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    let changesMade = false; // to track if any changes are made
    const results = {};

    // initialize transaction for multiple updates
    await db.transaction(async (tx) => {
      // check and update personal info if changed
      if (personalInfo) {
        const needsUpdate = Object.keys(personalInfo).some(
          key => personalInfo[key] !== currentUser[key]
        );

        // update personal info if provided
        if (needsUpdate) {
          const [updatedUser] = await tx
            .update(usersTable)
            .set(personalInfo)
            .where(eq(usersTable.id, id))
            .returning();

          const { password, ...safeUserData } = updatedUser;
          results.user = safeUserData;
          changesMade = true;
        }
      }

      // check and update business info if changed
      if (businessInfo) {
        const [currentBusiness] = await tx
          .select()
          .from(businessTable)
          .where(eq(businessTable.userId, id));

        if (currentBusiness) {
          const needsUpdate = Object.keys(businessInfo).some(
            key => businessInfo[key] !== currentBusiness[key]
          );

          if (needsUpdate) {
            const [updatedBusiness] = await tx
              .update(businessTable)
              .set(businessInfo)
              .where(eq(businessTable.userId, id))
              .returning();
            
            results.business = updatedBusiness;
            changesMade = true;
          }
        }
      }

      // handle password change if requested
      if (passwordInfo?.newPassword) {
        // verify current password if provided
        if (passwordInfo.currentPassword) {
          const isPasswordValid = await compare(
            passwordInfo.currentPassword,
            currentUser.password
          );

          if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
          }
        }

        // update only if new password is different
        const isSamePassword = await compare(
          passwordInfo.newPassword,
          currentUser.password
        );

        if (isSamePassword) {
          throw new Error("New password cannot be the same as current password");
        }


        // hash the new password
        const hashedPassword = await hash(passwordInfo.newPassword, 10);
        await tx
          .update(usersTable)
          .set({
            password: hashedPassword,
          })
          .where(eq(usersTable.id, id));
          
        changesMade = true;
      }
    });

    if (!changesMade) {
      return new NextResponse(
        JSON.stringify({ message: "No changes made. Please make some changes." }),
        { status: 200 }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Settings updated successfully",
        ...results,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.message?.includes("password") ? 400 : 500 }
    );
  }
}