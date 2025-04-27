'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function GoogleSignInButton() {
  // handle sign in with Google provider
  const handleSignIn = async () => {
    try {
      const result = await signIn('google', {
        // trigger NextAuth signIn with Google and redirect to dashboard on success
        callbackUrl: '/dashboard', // default callback URL      
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {/* Google logo */}
      <Image
        src="/google-logo.png"
        alt="Google Logo"
        width={20}
        height={20}
      />
      <span>Continue with Google</span>
    </button>
  );
}