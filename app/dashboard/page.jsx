'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/app/components/navbar';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, CurrencyDollarIcon, Bars3Icon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const { data: session, status } = useSession();

  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not authenticated. Please log in to access the dashboard.</p>;
  }

  // get the user's name from the session, default to "User" if not available
  const userName = session?.user?.name || 'User';

  return (
    <div className="flex h-screen">
      {/* Navbar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button and Hello Text */}
        <div className="flex justify-between mb-2">
          <span className="text-xl font-semibold text-gray-800">Hello, {userName}! Hope you have a great sales day!</span>
          <button className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-full">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <span>{session.user.name}</span>
          </button>
        </div>

        {/* Dashboard Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <CurrencyDollarIcon className="h-10 w-10 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500 mt-4">Revenue</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">Rs. 1,23,456</p>
            </div>

            {/* Orders Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <ShoppingCartIcon className="h-10 w-10 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500 mt-4">Orders</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">21</p>
            </div>

            {/* Customers Card */}
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
                <UserIcon className="h-10 w-10 text-red-500" />
                <h3 className="text-lg font-semibold text-red-500 mt-4">Customers</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">97</p>
            </div>
        </div>

        {/* Additional Content */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Sales Insights</h2>
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