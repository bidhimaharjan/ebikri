import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { paymentSecretsTable } from "@/src/db/schema/payment_secret";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcrypt";
import { encryptData } from '@/lib/encryption';
import jwt from 'jsonwebtoken';

// fetch user and business data
export async function GET(req, { params }) {
  try {
    let userId;
    const authHeader = req.headers.get("authorization");

    // check for mobile JWT token first
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        userId = decoded.userId;

        // verify the requested ID matches the token's user ID
        if (params.id !== userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }
    // fall back to NextAuth session for web requests
    else {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // verify user can only access their own data
      if (params.id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      userId = session.user.id;
    }

    // fetch user data
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // fetch business data
    const [business] = await db
      .select()
      .from(businessTable)
      .where(eq(businessTable.userId, userId));

    // fetch to check if payment secret exists (but do not return the actual secret)
    const [paymentSecret] = await db
      .select()
      .from(paymentSecretsTable)
      .where(eq(paymentSecretsTable.userId, userId));

    // remove sensitive fields before sending response
    const { password, ...safeUserData } = user;

    return NextResponse.json(
      {
        user: safeUserData,
        business: business || null,
        hasPaymentSecret: !!paymentSecret // only indicate if a secret exists (not the value)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// update user data, business data, and password
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // verify user can only access their own data
    if (id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      personalInfo, // { name, email, phoneNumber }
      businessInfo, // { businessName, businessType, businessEmail, panNumber }
      passwordInfo, // { currentPassword, newPassword }
      paymentInfo, // { liveSecretKey }
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
      
      // handle payment secret update if requested
      if (paymentInfo?.liveSecretKey) {
        // encrypt the live secret key
        const encryptedSecret = encryptData(paymentInfo.liveSecretKey);

        const [existingSecret] = await tx
          .select()
          .from(paymentSecretsTable)
          .where(eq(paymentSecretsTable.userId, id));

        if (existingSecret) {
          await tx
            .update(paymentSecretsTable)
            .set({
              liveSecretKey: encryptedSecret, // store the encrypted key
            })
            .where(eq(paymentSecretsTable.userId, id));
        } else {
          await tx.insert(paymentSecretsTable).values({
            userId: id,
            businessId: session.user.businessId, 
            liveSecretKey: encryptedSecret, // store the encrypted key
            paymentProvider: 'Khalti',
          });
        }
        changesMade = true;
      }
    });

    if (!changesMade) {
      return NextResponse.json(
        { message: "No changes made. Please make some changes." },
        { status: 200 }
      );      
    }

    return NextResponse.json(
      {
        message: "Settings updated successfully",
        ...results,
      },
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