// import EbikriLogo from '@/app/ui/ebikri-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-red-500 p-4 md:h-20">
        <EbikriLogo />
      </div> */}
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
      <div className="flex flex-col justify-center gap-10 rounded-lg bg-gray-50 px-6 py-10 md:w-1/2 md:px-20">
        <p className={`text-xl text-gray-800 md:text-4xl md:leading-normal`}>
          <strong>Welcome to eBikri</strong> 
        </p>
        <p>
          <span className="text-xl">eBikri is a complete Retail Business Management Application for your small online business.</span>
        </p>

        <div className="flex items-center gap-3">
          <p className="text-base">Don't have an account?</p>
          <Link
            href="/signup"
            className="flex items-center gap-4 rounded-3xl bg-red-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-red-400"
          >
            <span>Register</span> <ArrowRightIcon className="w-4" />
          </Link>
        </div>
      </div>
        {/* <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          // Add Hero Images Here
        </div> */}
      </div>
    </main>
  );
}
