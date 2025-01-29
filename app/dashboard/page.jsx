'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, ArrowRightOnRectangleIcon, HomeIcon, CubeIcon, ShoppingCartIcon, UserIcon, ChartBarIcon, PaperClipIcon, CogIcon, UserCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Here, you can clear session or token and redirect to login page
    alert('Logging out...');
    // Example: Redirect to login page
    window.location.href = '/login'; 
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } fixed inset-0 bg-gray-800 bg-opacity-50 z-50 md:hidden`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed z-50 inset-y-0 left-0 w-64 bg-red-500 text-white transform transition-transform md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 mt-6">
          <h2 className="text-xl font-bold">Logo</h2>
          <Bars3Icon
            className="h-6 w-6 text-white cursor-pointer md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
        <nav className="mt-4">
          <ul>
          <li>
              <Link href="/dashboard" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <HomeIcon className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/inventory" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <CubeIcon className="h-5 w-5" />
                Inventory
              </Link>
            </li>
            <li>
              <Link href="/orders" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <ShoppingCartIcon className="h-5 w-5" />
                Orders and Payments
              </Link>
            </li>
            <li>
              <Link href="/customers" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <UserIcon className="h-5 w-5" />
                Customers
              </Link>
            </li>
            <li>
              <Link href="/sales" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <ChartBarIcon className="h-5 w-5" />
                Sales Analytics
              </Link>
            </li>
            <li>
              <Link href="/marketing" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <PaperClipIcon className="h-5 w-5" />
                Marketing Tools
              </Link>
            </li>
            <li>
              <Link href="/settings" className="block px-6 py-4 text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3">
                <CogIcon className="h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="block w-full text-lg text-gray-300 hover:border-l-4 border-white-400 transition-transform hover:font-bold flex items-center gap-3 px-6 py-4"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button and Hello Text */}
        <div className="flex justify-between mb-6">
          <span className="text-xl font-semibold text-gray-800">Hello, ABC Retail!</span>
          <button className="text-gray-800">
            <UserCircleIcon className="h-8 w-8" />
          </button>
        </div>

        <div className="relative mb-6">
          <h1 className="text-xl font-semibold text-gray-800 mt-6">Dashboard</h1>
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
          {/* You can add a table or list of activities here */}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

// // DashboardLayout.tsx
// 'use client';

// import { useState } from 'react';
// import Sidebar from '@/app/components/layout'; // Import Sidebar
// import { UserCircleIcon, CurrencyDollarIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

// const DashboardLayout = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const handleLogout = () => {
//     alert('Logging out...');
//     window.location.href = '/login';
//   };

//   return (
//     <div className="flex h-screen">
//       {/* Sidebar Component */}
//       <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />

//       {/* Main Content Area */}
//       <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
//         {/* Profile Button and Hello Text */}
//         <div className="flex justify-between mb-6">
//           <span className="text-xl font-semibold text-gray-800">Hello, ABC Retail!</span>
//           <button className="text-gray-800">
//             <UserCircleIcon className="h-8 w-8" />
//           </button>
//         </div>

//         <div className="relative mb-6">
//           <h1 className="text-xl font-semibold text-gray-800 mt-6">Dashboard</h1>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Revenue Card */}
//           <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//             <CurrencyDollarIcon className="h-10 w-10 text-red-500" />
//             <h3 className="text-lg font-semibold text-red-500 mt-4">Revenue</h3>
//             <p className="text-2xl font-bold text-gray-900 mt-2">Rs. 1,23,456</p>
//           </div>

//           {/* Orders Card */}
//           <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//             <ShoppingCartIcon className="h-10 w-10 text-red-500" />
//             <h3 className="text-lg font-semibold text-red-500 mt-4">Orders</h3>
//             <p className="text-2xl font-bold text-gray-900 mt-2">21</p>
//           </div>

//           {/* Customers Card */}
//           <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
//             <UserIcon className="h-10 w-10 text-red-500" />
//             <h3 className="text-lg font-semibold text-red-500 mt-4">Customers</h3>
//             <p className="text-2xl font-bold text-gray-900 mt-2">97</p>
//           </div>
//         </div>

//         {/* Additional Content */}
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-gray-800">Sales Insights</h2>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
