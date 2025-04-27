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
    <main className="flex min-h-screen flex-col p-4 bg-gray-50">
      {/* <div className="flex h-20 shrink-0 items-end rounded-lg bg-purple-500 p-4 md:h-20">
        <EbikriLogo />
        </div> */}

      <div className="flex grow flex-col gap-4 md:flex-row">
        {/* Left Section */}
        <div className="flex flex-col justify-center gap-10 px-6 py-10 md:w-1/2 md:px-20">
          <p className={`text-xl text-gray-800 md:text-4xl md:leading-normal`}>
            <strong>Welcome to eBikri</strong>
          </p>
          <p>
            <span className="text-xl">
              eBikri is a complete Retail Business Management Application for
              your small online business.
            </span>
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
        <div className="hidden md:block w-px bg-gray-300"></div>

        {/* Right Section */}
        <div className="flex flex-col justify-center gap-2 px-6 py-10 md:w-1/2 md:px-20">
          <SignupForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {/* Add Google Sign-In Button */}
          <div className="relative flex items-center px-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 mb-4">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="relative flex items-center px-6">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
    </main>
  );
}
