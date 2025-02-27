import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt';

export const authOptions = {
  // define authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
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
          throw new Error('No user found with this email');
        }

        // if password is incorrect, throw an error
        const isValid = await compare(password, user[0].password);
        if (!isValid) {
          throw new Error('Password is incorrect');
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
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt', // use JWT tokens for session management
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.businessId = user.businessId;
      }
      // console.log("JWT Token: ", token);
      return token;
    },
    async session({ session, token }) {
      // console.log("Session Callback - Token: ", token);
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.businessId = token.businessId;
      // console.log("Session: ", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // secret key for signing JWTs
};

// create an authentication handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };