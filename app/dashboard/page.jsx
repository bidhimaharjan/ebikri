'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { ShoppingCartIcon, UserIcon, UserCircleIcon, CurrencyDollarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import BusinessName from "@/components/businessname";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Link from 'next/link';

const DashboardLayout = () => {
  const { data: session, status } = useSession();
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({ revenue: 0, totalOrders: 0, totalCustomers: 0 });
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // fetch dashboard data
  useEffect(() => {
    if (session) {
      const fetchDashboardData = async () => {
        try {
          // Fetch dashboard data
          const dashboardResponse = await fetch('/api/dashboard');
          if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
          const dashboardData = await dashboardResponse.json();
          setDashboardData(dashboardData);

          // Fetch sales data for monthly trends and top products
          const salesResponse = await fetch(`/api/sales?businessId=${session.user.businessId}`);
          if (!salesResponse.ok) throw new Error('Failed to fetch sales data');
          const salesData = await salesResponse.json();

          // Calculate monthly trends
          const monthly = calculateTrends(salesData, "month");
          setMonthlyTrends(monthly);

          // Calculate top 3 products for the month
          const topProducts = calculateTopProducts(salesData, "month");
          setTopProducts(topProducts);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

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
        <p>You are not authenticated. Please log in to access the dashboard.</p>;
      </div>
    );
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
          <span className="text-lg font-semibold text-gray-800">
            Hello, {userName}! Hope you have a great sales day!
          </span>
          
          <Link href="/profile">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <CurrencyDollarIcon className="h-10 w-10 text-green-500" />
            <h3 className="text-lg font-semibold text-green-500 mt-4">
              Revenue
            </h3>
            <p className="text-2xl font-bold text-green-500 mt-2">
              Rs. {dashboardData.revenue.toLocaleString()}
            </p>
          </div>

          {/* Orders Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <ShoppingCartIcon className="h-10 w-10 text-red-500" />
            <h3 className="text-lg font-semibold text-red-500 mt-4">Orders</h3>
            <p className="text-2xl font-bold text-red-500 mt-2">
              {dashboardData.totalOrders}
            </p>
          </div>

          {/* Customers Card */}
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <UserIcon className="h-10 w-10 text-orange-500" />
            <h3 className="text-lg font-semibold text-orange-500 mt-4">
              Customers
            </h3>
            <p className="text-2xl font-bold text-orange-500 mt-2">
              {dashboardData.totalCustomers}
            </p>
          </div>
        </div>

        {/* Monthly Sales Trend and Top 3 Products */}
        <div className="mt-6 flex space-x-6">
          {/* Monthly Sales Trend Chart */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Monthly Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
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

          {/* Top 3 Products of the Month Card */}
          <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
              Top 3 Products of the Month
            </h2>
            <div className="flex flex-col space-y-4 text-center">
              {topProducts.map((product) => (
                <div
                  key={product.productId}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm"
                >
                  <p className="text-blue-400 text-lg font-bold">
                    {product.productName} (ID{product.productId})
                  </p>
                  <p className="text-lg text-gray-600">
                    {product.quantitySold} Items Sold
                  </p>
                </div>
              ))}
            </div>
          </div>
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