"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ResetPasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // check token and session status on component mount
  useEffect(() => {
    if (status === "loading") return;

    if (!token) {
      toast.error("Invalid or expired reset link");
      router.push("/auth/forgot-password");
      return;
    }

    if (session) {
      // if user is already logged in, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    setIsLoading(false);
  }, [session, status, router, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast.success("Password reset successfully! You can now login with your new password.");
      router.push("/login");
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // consistent input styles
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
          <h1 className="text-2xl font-bold text-purple-500">Set New Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create a new password for your account
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="password"
          >
            New Password *
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              className={getInputClass()}
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
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