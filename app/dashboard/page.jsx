'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, CurrencyDollarIcon, Bars3Icon } from '@heroicons/react/24/outline';
import BusinessName from "@/components/businessname";

const DashboardLayout = () => {
  const { data: session, status } = useSession();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({ revenue: 0, totalOrders: 0, totalCustomers: 0 });

  useEffect(() => {
    if (session) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) throw new Error('Failed to fetch data');
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      };

      fetchDashboardData();
    }
  }, [session]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not authenticated. Please log in to access the dashboard.</p>;
  }

  // get the user's name from the session, default to "User" if not found
  const userName = session?.user?.name || 'User';

  return (
    <div className="flex h-screen">
      {/* Navbar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button and Hello Text */}
        <div className="flex justify-between mb-2">
          <span className="text-lg font-semibold text-gray-700">Hello, {userName}! Hope you have a great sales day!</span>
          <button className="flex items-center px-4 py-2 bg-white text-blue-500 font-bold border border-blue-500 rounded-full hover:bg-blue-500 hover:text-white">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <BusinessName userId={session.user.id} />
          </button>
        </div>

        {/* Dashboard Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-700 mt-2">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <CurrencyDollarIcon className="h-10 w-10 text-green-500" />
                <h3 className="text-lg font-semibold text-green-500 mt-4">Revenue</h3>
                <p className="text-2xl font-bold text-green-500 mt-2">Rs. {dashboardData.revenue.toLocaleString()}</p>
            </div>

            {/* Orders Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <ShoppingCartIcon className="h-10 w-10 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500 mt-4">Orders</h3>
                <p className="text-2xl font-bold text-red-500 mt-2">{dashboardData.totalOrders}</p>
            </div>

            {/* Customers Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <UserIcon className="h-10 w-10 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-500 mt-4">Customers</h3>
                <p className="text-2xl font-bold text-orange-500 mt-2">{dashboardData.totalCustomers}</p>
            </div>
        </div>

        {/* Additional Content */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">Sales Insights</h2>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-4">
          ©2025 eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;