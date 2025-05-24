"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/outline"; 

export default function PaymentFailure() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000); // redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg text-center w-full max-w-md">
        <h1 className="text-xl md:text-2xl font-bold text-red-600 mb-3 md:mb-4">
          Payment Failed!
        </h1>
        <p className="text-gray-700 text-sm md:text-base">
          Unfortunately, your payment could not be processed. Please try again.
        </p>
        <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base">
          You will be redirected to the home page in 5 seconds...
        </p>
        <a
          href="/"
          className="mt-4 md:mt-6 inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm md:text-base"
        >
          <HomeIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          Return to Home
        </a>
      </div>
    </div>
  );
}