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
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // forces account selection
          access_type: "offline", // allows refresh tokens
          response_type: "code",
        },
      },
    }),
    // Email/Password Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // runs when a user submits login form
      async authorize(credentials) {
        // email and password from user input
        const { email, password } = credentials;

        // find user by email
        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        // if no user is found, throw an error
        if (user.length === 0) throw new Error("No user found with this email");

        // verify password
        const isValid = await compare(password, user[0].password);
        if (!isValid) throw new Error("Password is incorrect");

        // fetch business ID linked to the user
        const business = await db
          .select({ businessId: businessTable.id })
          .from(businessTable)
          .where(eq(businessTable.userId, user[0].id)) // match business with user ID
          .limit(1);

        // return user data for session
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          businessId: business[0]?.businessId || null,
          phoneNumber: user[0].phoneNumber,
          requiresProfileCompletion: user[0].requiresProfileCompletion,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // use JWT web tokens for session management
  },
  callbacks: {
    // custom sign in callback to handle Google sign ins
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // check if user already exists
          const [existingUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, profile.email))
            .limit(1);

          // New Google user
          if (!existingUser) {
            // create new user record for Google sign in
            const [newUser] = await db
              .insert(usersTable)
              .values({
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                provider: "google",
                emailVerified: new Date(),
                requiresProfileCompletion: true, // new users must complete profile
              })
              .returning();
              
            // create empty business profile
            await db.insert(businessTable).values({
              userId: newUser.id
            });
    
            return true; // allow sign in but redirect to profile completion
          }
          
          // for existing users, check if profile needs completion
          return !existingUser.requiresProfileCompletion;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    // build the JWT token with additional data attached
    async jwt({ token, user, account, profile }) {
      // handle initial sign in
      if (user) {
        // for Google sign in
        if (account?.provider === "google") {
          const [dbUser] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, user.email || profile?.email))  // get user by email
            .limit(1);
    
          if (dbUser) {
            const [business] = await db
              .select({ id: businessTable.id })
              .from(businessTable)
              .where(eq(businessTable.userId, dbUser.id)) // get user's business, if exists
              .limit(1);
              
            // return token with user data
            return {
              ...token,
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              businessId: business?.id || null,
              picture: dbUser.image,
              provider: "google",
              requiresProfileCompletion: dbUser.requiresProfileCompletion,
            };
          }
        }
    
        // for credential sign in
        return {
          ...token,
          ...user,
          requiresProfileCompletion: user.requiresProfileCompletion ?? true
        };
      }
    
      // refresh 'requiresProfileCompletion' from database to make sure that the JWT is up-to-date 
      // and prevent users who have already completed their profile from being redirected to complete-profile page
      if (token?.id) {
        // fetch latest user info from database by their token.id
        const [dbUser] = await db
          .select({
            requiresProfileCompletion: usersTable.requiresProfileCompletion,
            phoneNumber: usersTable.phoneNumber
          })
          .from(usersTable)
          .where(eq(usersTable.id, token.id))
          .limit(1);
    
        if (dbUser) {
          // merge the latest requiresProfileCompletion value into token
          return {
            ...token,
            requiresProfileCompletion: dbUser.requiresProfileCompletion
          };
        }
      }
    
      return token;
    },
    // token data into session data
    async session({ session, token }) {
      return {
        ...session, // keep existing session data
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
  // custom page routes for auth flows
  pages: {
    signIn: '/login', // for login
    error: '/auth/error', // for errors
    newUser: '/auth/complete-profile', // for new users to complete their profile
  },

  secret: process.env.NEXTAUTH_SECRET, // for token encryption
};

// create API handler for both GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
