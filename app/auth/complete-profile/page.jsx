"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CompleteProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    businessName: "",
    businessType: "",
    businessEmail: "",
    panNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // check session status and user profile completion requirement on component mount
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // if no active session, redirect to login
      router.push("/login");
      return;
    }

    if (!session.user?.requiresProfileCompletion) {
      // if profile completion is not required, redirect to dashboard
      router.push("/dashboard");
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // handle input field changes and update form state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // send form data to API endpoint for profile completion
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      // update session with new user data and mark profile completion as done
      await update({
        user: {
          ...session.user,
          ...data.user, // include all returned user data
          requiresProfileCompletion: false,
        },
      });

      toast.success("Profile completed successfully!");
      // force a full page reload to trigger NextAuth middleware updates
      // setTimeout(() => {
      //   window.location.href = "/dashboard";
      // }, 3000);
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // function for consistent input styling
  const getInputClass = (name) =>
    `peer block w-full rounded-xl border border-gray-200 py-[8px] pl-4 text-xs outline-2 placeholder:text-gray-500`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg px-6 py-8 w-full max-w-xl space-y-5"
      >
        {/* Title */}
        <h1 className={`$ text-xl font-bold text-purple-500 text-center`}>
          Complete Your Profile
        </h1>

        <p className="text-sm text-gray-600 text-center">
          Please provide your personal and business details to continue.
        </p>

        {/* Phone Number Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="phoneNumber"
          >
            Phone Number *
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"

            placeholder="Enter a 10-digit phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={getInputClass("phoneNumber")}
          />
        </div>

        {/* Business Name Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="businessName"
          >
            Business Name *
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="Enter your business name"
            value={formData.businessName}
            onChange={handleChange}
            className={getInputClass("businessName")}
          />
        </div>

        {/* Business Type Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="businessType"
          >
            Business Type *
          </label>
          <select
            id="businessType"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className={getInputClass("businessType")}
          >
            <option value="">Select business type</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Service">Service</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Business Email Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="businessEmail"
          >
            Business Email
          </label>
          <input
            id="businessEmail"
            name="businessEmail"
            type="email"
            placeholder="Enter business email"
            value={formData.businessEmail}
            onChange={handleChange}
            className={getInputClass("businessEmail")}
          />
        </div>

        {/* PAN Number Field */}
        <div>
          <label
            className="block font-medium text-sm text-gray-900 mb-2"
            htmlFor="panNumber"
          >
            PAN Number
          </label>
          <input
            id="panNumber"
            name="panNumber"
            type="text"
            placeholder="Enter 9-digit PAN number"
            value={formData.panNumber}
            onChange={handleChange}
            className={getInputClass("panNumber")}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-500 text-white py-2 px-4 rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Complete Profile"}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
      </div>
    </div>
  );
}
