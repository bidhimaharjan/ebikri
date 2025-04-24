import { verify } from 'jsonwebtoken';

// function to verify JWT token and return the decoded payload (data inside it) if valid
export async function verifyToken(token) {
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET); // verify the token using the secret
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}