"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";

const ProfileLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [businessData, setBusinessData] = useState({
    businessName: "",
    businessType: "",
    businessEmail: "",
    panNumber: "",
  });

  // fetch user and business data
  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/settings/${session.user.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();

      // Set user data
      setUserData({
        name: data.user?.name || "Not provided",
        email: data.user?.email || "Not provided",
        phoneNumber: data.user?.phoneNumber || "Not provided",
      });

      // Set business data (handle case where business might be null)
      setBusinessData({
        businessName: data.business?.businessName || "Not provided",
        businessType: data.business?.businessType || "Not provided",
        businessEmail: data.business?.businessEmail || "Not provided",
        panNumber: data.business?.panNumber || "Not provided",
      });
    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching profile data:", error);
    }
  };

  // fetch data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfileData();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the profile.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Navigation Bar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button */}
        <div className="flex justify-end mb-2">
          <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <BusinessName userId={session.user.id} />
          </button>
        </div>

        {/* Profile Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Profile</h1>
          <p className="text-gray-600">
            View your personal and business information
          </p>
        </div>

        {/* Edit Profile Button */}
        <Link href="/settings" passHref prefetch>
          <button className="h-10 px-4 py-2 mb-4 bg-purple-500 text-white text-sm font-medium rounded-md flex items-center hover:bg-purple-400">
            <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
          </button>
        </Link>

        {/* Content Container */}
        <div className="flex-grow">
          {/* Personal Information Section */}
          <div className="px-4 py-5 sm:p-6 mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{userData.name}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{userData.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Phone number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {userData.phoneNumber}
                </dd>
              </div>
            </dl>
          </div>

          {/* Business Information Section */}
          <div className="px-4 py-5 sm:p-6 border-t border-gray-300">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 mt-4">
              Business Information
            </h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Business name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {businessData.businessName}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Business type
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {businessData.businessType}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  Business email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {businessData.businessEmail}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-semibold text-gray-500">
                  PAN number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {businessData.panNumber}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-20">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
