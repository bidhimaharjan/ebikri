import { db } from '@/src/index';
import { usersTable } from '@/src/db/schema/users';
import { compare } from 'bcrypt'; // for comparing password hashes
import { eq } from 'drizzle-orm'; // eq function for comparison

export async function POST(req) {
  try {
    // Get the form data (email and password) from the request body
    const { email, password } = await req.json();

    // Check if both email and password are provided
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
    }

    // Check if the user exists in the database
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1); // Only get the first match

    // If user is not found, return an error
    if (user.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordCorrect = await compare(password, user[0].password);

    // If the password doesn't match, return an error
    if (!isPasswordCorrect) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
    }

    // On successful login, return a success response
    return new Response(JSON.stringify({ message: 'Welcome to eBikri' }), { status: 200 });
    
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
