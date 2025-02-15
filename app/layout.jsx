'use client';

import '@/app/ui/global.css';
import { lusitana } from '@/app/ui/fonts';
import { SessionProvider } from 'next-auth/react';  // import the SessionProvider

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} antialiased`}>
        {/* wrap children with SessionProvider for client-side */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
