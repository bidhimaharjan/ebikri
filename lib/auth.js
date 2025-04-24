// lib/auth.js
import { verify } from 'jsonwebtoken';

export async function verifyToken(token) {
  try {
    const decoded = verify(token, process.env.NEXTAUTH_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}