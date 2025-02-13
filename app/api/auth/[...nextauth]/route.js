import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { businessTable } from '@/src/db/schema/business';
import { eq } from 'drizzle-orm';
import { compare } from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (user.length === 0) {
          throw new Error('No user found with this email');
        }

        const isValid = await compare(password, user[0].password);

        if (!isValid) {
          throw new Error('Password is incorrect');
        }

        // fetch business ID linked to the user
        const business = await db
          .select({ businessId: businessTable.id })
          .from(businessTable)
          .where(eq(businessTable.userId, user[0].id))
          .limit(1);

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
    strategy: 'jwt',
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };