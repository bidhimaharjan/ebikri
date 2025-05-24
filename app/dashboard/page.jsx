'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, CurrencyDollarIcon, TrophyIcon, Bars3Icon } from '@heroicons/react/24/outline';
import BusinessName from "@/components/businessname";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const DashboardLayout = () => {
  const { data: session, status } = useSession();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({ revenue: 0, totalOrders: 0, totalCustomers: 0 });
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      // fetch dashboard data
      const dashboardResponse = await fetch('/api/dashboard');
      if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
      const dashboardData = await dashboardResponse.json();
      setDashboardData(dashboardData);

      // fetch sales data for monthly trends and top products
      const salesResponse = await fetch(`/api/sales?businessId=${session.user.businessId}`);
      if (!salesResponse.ok) throw new Error('Failed to fetch sales data');
      const salesData = await salesResponse.json();

      // calculate monthly trends
      const monthly = calculateTrends(salesData, "month");
      setMonthlyTrends(monthly);

      // calculate top 3 products for the month
      const topProducts = calculateTopProducts(salesData, "month");
      setTopProducts(topProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // fetch dashboard data on component mount
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  // calculate trends (monthly or yearly)
  const calculateTrends = (data, period) => {
    const trends = {};

    data.forEach((sale) => {
      const date = new Date(sale.saleDate);
      const key =
        period === "month"
          ? date.toLocaleString("default", { month: "short", year: "numeric" }) // Format: "Mar 2025"
          : `${date.getFullYear()}`; // Format: "2025"

      if (!trends[key]) {
        trends[key] = { revenue: 0, quantitySold: 0 };
      }

      trends[key].revenue += parseFloat(sale.revenue);
      trends[key].quantitySold += sale.quantitySold;
    });

    return Object.keys(trends).map((key) => ({
      period: key,
      revenue: trends[key].revenue,
      quantitySold: trends[key].quantitySold,
    }));
  };

  // calculate top 3 most sold products
  const calculateTopProducts = (data, period) => {
    const products = {};

    data.forEach((sale) => {
      const date = new Date(sale.saleDate);
      const key =
        period === "month"
          ? `${date.getFullYear()}-${date.getMonth() + 1}` // Format: YYYY-MM
          : `${date.getFullYear()}`; // Format: YYYY

      if (!products[sale.productId]) {
        products[sale.productId] = {
          productId: sale.productId,
          productName: sale.productName || `Product ${sale.productId}`,
          quantitySold: 0,
        };
      }

      products[sale.productId].quantitySold += sale.quantitySold;
    });

    return Object.values(products)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 3); // top 3 products
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the dashboard.</p>
      </div>
    );
  }

  // get the user's name from the session, default to "User" if not found
  const userName = session?.user?.name || 'User';

  return (
    <div className="flex h-screen">
      {/* Navigation Bar - Desktop */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-4 md:p-10 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Profile Button - Mobile */}
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-3 py-1 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-4 w-4 mr-1" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-container md:hidden fixed inset-0 z-50 bg-white p-4 shadow-lg">
            <Navbar 
              isNavbarOpen={true} 
              setIsNavbarOpen={setIsMobileMenuOpen} 
              mobileView={true}
            />
          </div>
        )}

        {/* Profile Button and Hello Text - Desktop */}
        <div className="hidden lg:flex justify-between mb-2">
          <span className="text-lg font-semibold text-gray-800">
            Hello, {userName}! Hope you have a great sales day!
          </span>
          
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Profile Button - Medium and Small screens */}
        <div className="hidden md:flex lg:hidden justify-end mb-2">
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Dashboard Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Dashboard
          </h1>
          <p className="text-gray-600">Overview of your business performance with key insights</p>
        </div>

        {/* Revenue, Orders, and Customers Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Revenue Card */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <CurrencyDollarIcon className="h-8 md:h-10 w-8 md:w-10 text-green-500" />
            <h3 className="text-md md:text-lg font-semibold text-green-500 mt-2 md:mt-4">
              Revenue
            </h3>
            <p className="text-xl md:text-2xl font-bold text-green-500 mt-1 md:mt-2">
              Rs. {dashboardData.revenue.toLocaleString()}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <ShoppingCartIcon className="h-8 md:h-10 w-8 md:w-10 text-red-500" />
            <h3 className="text-md md:text-lg font-semibold text-red-500 mt-2 md:mt-4">Orders</h3>
            <p className="text-xl md:text-2xl font-bold text-red-500 mt-1 md:mt-2">
              {dashboardData.totalOrders}
            </p>
          </div>

          {/* Customers Card */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <UserIcon className="h-8 md:h-10 w-8 md:w-10 text-orange-500" />
            <h3 className="text-md md:text-lg font-semibold text-orange-500 mt-2 md:mt-4">
              Customers
            </h3>
            <p className="text-xl md:text-2xl font-bold text-orange-500 mt-1 md:mt-2">
              {dashboardData.totalCustomers}
            </p>
          </div>
        </div>

        {/* Monthly Sales Trend and Top 3 Products */}
        <div className="mt-6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Monthly Sales Trend Chart */}
          <div className="flex-1 bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
              Monthly Sales Trend
            </h2>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    name="Revenue (Rs.)"
                  />
                  <Line
                    type="monotone"
                    dataKey="quantitySold"
                    stroke="#3b82f6"
                    name="Items Sold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 3 Products of the Month Card */}
          <div className="w-full lg:w-1/3 bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrophyIcon className="h-5 md:h-6 w-5 md:w-6 text-yellow-500 mr-2" />
              Top Products This Month
            </h2>
            <div className="flex flex-col space-y-3 md:space-y-4 text-center">
              {topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm"
                >
                  <p className="text-blue-400 text-md md:text-lg font-bold">
                    {product.productName} (ID{product.productId})
                  </p>
                  <p className="text-md md:text-lg text-gray-600">
                    {product.quantitySold} Items Sold
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-4">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;