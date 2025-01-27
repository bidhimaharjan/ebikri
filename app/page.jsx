// import EbikriLogo from '@/app/ui/ebikri-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {
  const currentUrl = process.env.NEXT_PUBLIC_VERCEL_URL || `http://localhost:${process.env.PORT || 3000}`;
  console.log('App running at:', currentUrl);
  
  return (
    <main className="flex min-h-screen flex-col bg-gray-50 p-6">
      {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-red-500 p-4 md:h-20">
        <EbikriLogo />
      </div> */}
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
      
      {/* Left Section */}
      <div className="flex flex-col justify-center gap-10 rounded-lg px-6 py-10 md:w-1/2 md:px-20">
        <p className={`text-xl text-gray-800 md:text-4xl md:leading-normal`}>
          <strong>Welcome to eBikri</strong> 
        </p>
        <p>
          <span className="text-xl">eBikri is a complete Retail Business Management Application for your small online business.</span>
        </p>

        <div className="flex items-center gap-3">
          <p className="text-base">Don't have an account?</p>
          <Link href="/signup">
            <Button className="flex items-center gap-4 rounded-xl bg-red-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-red-400">
              <span>Register</span> <ArrowRightIcon className="w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center md:w-1/2">
          <Image 
            src="/homepage/first.jpg" 
            alt="eBikri Homepage" 
            width={600} 
            height={600} 
            className="rounded-xl shadow-lg"
          />
      </div>

        {/* <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          // Add Hero Images Here
        </div> */}
      </div>
    </main>
  );
}
