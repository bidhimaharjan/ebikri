"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";

const SalesLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { data: session, status } = useSession();
  // fetch sales data
  const fetchSalesData = async () => {
    try {
      const response = await fetch(
        `/api/sales?businessId=${session.user.businessId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const data = await response.json();
    //   setIsSalesData(data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  useEffect(() => {
    if (session) {
        fetchSalesData();
    }
  }, [session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <p>You are not authenticated. Please log in to access the inventory.</p>
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
          <button className="flex items-center px-4 py-2 bg-white text-blue-500 font-bold border border-blue-500 rounded-full hover:bg-blue-500 hover:text-white">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <BusinessName userId={session.user.id} />
          </button>
        </div>

        {/* Sales Analytics Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-700 mt-2">
            Sales Analytics
          </h1>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2">
          ©2025 eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SalesLayout;
