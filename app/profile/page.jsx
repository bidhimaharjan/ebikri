"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";

const ProfileLayout = () => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const { data: session, status } = useSession();
    const [inventory, setInventory] = useState([]);
  
    // fetch inventory data
    const fetchInventory = async () => {
      try {
        const response = await fetch(
          `/api/inventory?businessId=${session.user.businessId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };
  
    useEffect(() => {
      if (session) {
        fetchInventory();
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
            <button className="flex items-center px-4 py-2 bg-purple-400 text-white font-bold border border-purple-400 rounded-full hover:bg-white hover:text-purple-400">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </div>
          

          {/* Profile Title */}
          <div className="relative mb-4">
            <h1 className="text-xl font-semibold text-gray-800 mt-2">
              Profile
            </h1>
            <p className="text-gray-600">View your personal and business information</p>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-2">
            ©2025 eBikri. All Rights Reserved
          </div>
        </div>
      </div>
    );
  };
  
  export default ProfileLayout;