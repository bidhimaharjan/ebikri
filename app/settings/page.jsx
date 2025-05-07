"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import Navbar from "@/components/navbar";
import BusinessName from "@/components/businessname";
import Link from "next/link";
import EditPersonalForm from "@/components/settings/edit-personal-form";
import EditBusinessForm from "@/components/settings/edit-business-form";
import EditPasswordForm from "@/components/settings/edit-password-form";
import EditPaymentForm from "@/components/settings/edit-payment-key-form";

const SettingsLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  // payment integration state
  const [hasPaymentSecret, setHasPaymentSecret] = useState(false);
  // state for all user data
  const [userData, setUserData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    businessInfo: {
      businessName: "",
      businessType: "",
      businessEmail: "",
      panNumber: "",
    },
  });

  // function to fetch user data
  const fetchUserData = async () => {
    if (session?.user?.id) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/settings/${session.user.id}`);
        const data = await response.json();

        setUserData({
          personalInfo: {
            name: data.user?.name || "",
            email: data.user?.email || "",
            phoneNumber: data.user?.phoneNumber || "",
          },
          businessInfo: {
            businessName: data.business?.businessName || "",
            businessType: data.business?.businessType || "",
            businessEmail: data.business?.businessEmail || "",
            panNumber: data.business?.panNumber || "",
          },
        });
        setHasPaymentSecret(data.hasPaymentSecret || false);
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // fetch user data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the settings.</p>
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
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Settings Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account, business, and payment information
          </p>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <EditPersonalForm
            initialData={userData.personalInfo}
            userId={session.user.id}
          />
        </div>

        {/* Business Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <EditBusinessForm
            initialData={userData.businessInfo}
            userId={session.user.id}
          />
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <EditPasswordForm userId={session.user.id} />
        </div>

        {/* Payment Integration Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <EditPaymentForm
            hasPaymentSecret={hasPaymentSecret}
            userId={session.user.id}
            onSuccess={() => {
              setHasPaymentSecret(true); // refresh the state
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
