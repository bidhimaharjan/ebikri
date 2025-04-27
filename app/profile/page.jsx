"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { UserCircleIcon, PencilIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
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

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-10">
            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
              <UserCircleIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Full name</p>
                <p className="text-sm text-gray-900 mt-1">{userData.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email address</p>
                <p className="text-sm text-gray-900 mt-1">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone number</p>
                <p className="text-sm text-gray-900 mt-1">{userData.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Business Information Card */}
          <div className="bg-white rounded-lg shadow-sm p-10">
            <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Business Information
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Business name</p>
                <p className="text-sm text-gray-900 mt-1">{businessData.businessName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Business type</p>
                <p className="text-sm text-gray-900 mt-1">{businessData.businessType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Business email</p>
                <p className="text-sm text-gray-900 mt-1">{businessData.businessEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PAN number</p>
                <p className="text-sm text-gray-900 mt-1">{businessData.panNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-40">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
