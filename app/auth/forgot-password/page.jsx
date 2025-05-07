"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AtSymbolIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check session status on component mount
  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // If user is already logged in, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      toast.success("If this email exists, we've sent a reset link");
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Consistent input styling
  const getInputClass = () =>
    `peer block w-full rounded-xl border border-gray-200 py-[8px] pl-10 text-sm outline-2 placeholder:text-gray-500`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-purple-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg px-8 py-8 w-full max-w-md space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-500">Forgot Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="email"
          >
            Email *
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className={getInputClass()}
              required
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Back to Login Link */}
        <div className="text-center text-sm mt-4">
          <Link
            href="/login"
            className="text-purple-500 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
      </div>
    </div>
  );
}