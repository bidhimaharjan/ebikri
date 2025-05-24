"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupForm from "@/components/users/signup-form";
import { Button } from "@/app/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { validateSignupForm } from "@/app/validation/signup";
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'; 

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessType: "",
    businessEmail: "",
    panNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate form data
    const errors = validateSignupForm(formData);
    // check for errors
    if (Object.keys(errors).length > 0) {
      // display the first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("User and business registered successfully!");
        setFormData({
          name: "",
          phoneNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
          businessName: "",
          businessType: "",
          businessEmail: "",
          panNumber: "",
        });
        // redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await response.json();
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-2 bg-gray-50">
      <div className="flex grow flex-col gap-4 md:flex-row">
        {/* Left Section - Desktop */}
        <div className="hidden lg:flex flex-col justify-center gap-6 px-6 py-10 lg:w-1/2 xl:px-20">
          <p className="text-3xl text-gray-800 xl:text-4xl">
            <strong>Welcome to eBikri</strong>
          </p>
          <p className="text-lg xl:text-xl">
            eBikri is a complete Retail Business Management Application for
            your small online business.
          </p>

          <div className="flex items-center gap-3">
            <p className="text-base">Already have an account?</p>
            <Link href="/login">
              <Button className="flex items-center gap-4 rounded-xl bg-purple-500 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-purple-400">
                <span>Log in</span> <ArrowRightIcon className="w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Vertical line */}
        <div className="hidden lg:block w-px bg-gray-300"></div>

        {/* Right Section */}
        <div className="flex flex-col justify-center gap-2 px-4 py-6 w-full lg:w-1/2 lg:px-8 xl:px-20">
          {/* Login Button - Mobile and Medium */}
          <div className="flex items-center justify-center gap-3 mb-4 lg:hidden">
            <p className="text-sm">Already have an account?</p>
            <Link href="/login">
              <Button className="flex items-center gap-2 rounded-xl bg-purple-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-400">
                <span>Log in</span> <ArrowRightIcon className="w-3" />
              </Button>
            </Link>
          </div>

          <SignupForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Google Sign in Button */}
          <div className="relative flex items-center px-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 mb-4 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="relative flex items-center px-4">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </main>
  );
}
