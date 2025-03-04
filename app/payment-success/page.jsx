"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeIcon } from "@heroicons/react/24/outline"; 

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 5000); // redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-700">
          Thank you for your payment.
        </p>
        <p className="text-gray-500 mt-4">
          You will be redirected to the home page in 5 seconds...
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          <HomeIcon className="w-5 h-5 mr-2" />
          Return to Home
        </a>
      </div>
    </div>
  );
}