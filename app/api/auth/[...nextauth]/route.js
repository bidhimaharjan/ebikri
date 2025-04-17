import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/src/index";
import { usersTable } from "@/src/db/schema/users";
import { businessTable } from "@/src/db/schema/business";
import { eq } from "drizzle-orm";
import { compare } from "bcrypt";

export const authOptions = {
  // define authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // forces account selection
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // email and password from user input
        const { email, password } = credentials;

        // query database to find user by email
        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        // if no user is found, throw an error
        if (user.length === 0) {
          throw new Error("No user found with this email");
        }

        // if password is incorrect, throw an error
        const isValid = await compare(password, user[0].password);
        if (!isValid) {
          throw new Error("Password is incorrect");
        }

        // fetch business ID linked to the user
        const business = await db
          .select({ businessId: businessTable.id }) // select only the business ID
          .from(businessTable)
          .where(eq(businessTable.userId, user[0].id)) // match business with user ID
          .limit(1);

        // return user session data
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          businessId: business[0]?.businessId || null,
          phoneNumber: user[0].phoneNumber,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // use JWT tokens for session management
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, profile.email))
            .limit(1);

          if (existingUser.length === 0) {
            // New Google user - create user and business
            const [newUser] = await db
              .insert(usersTable)
              .values({
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                provider: "google",
                emailVerified: new Date(),
              })
              .returning();

            await db
              .insert(businessTable)
              .values({
                userId: newUser.id,
              });

            // Return true to allow sign-in but indicate profile needs completion
            return true;
          } else {
            // Existing Google user - check if profile is complete
            if (!existingUser[0].phoneNumber) {
              // Profile needs completion
              return true;
            }
            // Profile is complete
            return true;
          }
        } catch (error) {
          console.error("Google sign-in error:", error);
          return `/auth/error?error=${encodeURIComponent(error.message)}`;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // handle Google sign-in
      if (account?.provider === "google" && profile) {
        const dbUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, profile.email))
          .limit(1);

        if (dbUser.length > 0) {
          // get the business ID
          const business = await db
            .select({ id: businessTable.id })
            .from(businessTable)
            .where(eq(businessTable.userId, dbUser[0].id))
            .limit(1);

          // update token with all necessary data
          const newToken = {
            ...token,
            id: dbUser[0].id,
            email: dbUser[0].email,
            name: dbUser[0].name,
            businessId: business[0]?.id || null,
            picture: profile.picture,
            provider: "google",
            requiresProfileCompletion: !dbUser[0].phoneNumber,
          };

          console.log("\n[Google JWT] Returning token:", newToken);
          return newToken;
        }
      }

      // handle credential sign-in
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          businessId: user.businessId, // this should come from the authorize callback
          provider: "credentials",
          requiresProfileCompletion: !user.phoneNumber,
        };
      }

      return token;
    },
    async session({ session, token }) {
      // ensure all fields are properly transferred from token to session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          businessId: token.businessId,
          image: token.picture,
          provider: token.provider,
          requiresProfileCompletion: token.requiresProfileCompletion,
        },
      };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// create an authentication handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
