'use client';

import { useState } from 'react';
import Navbar from '@/app/components/navbar';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const OrdersLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Navbar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button */}
        <div className="flex justify-end mb-2">
          <button className="text-gray-800">
            <UserCircleIcon className="h-8 w-8" />
          </button>
        </div>

        {/* Orders and Payments Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Orders and Payments</h1>
        </div>
      </div>
    </div>
  );
};

export default OrdersLayout;
