"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { UserCircleIcon, TrophyIcon, Bars3Icon } from "@heroicons/react/24/outline";
import BusinessName from "@/components/businessname";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import Link from 'next/link';

const SalesLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [yearlyTrends, setYearlyTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" or "yearly"
  const [salesGrowth, setSalesGrowth] = useState(null);

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

  // function to fetch sales data
  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/sales?businessId=${session.user.businessId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const data = await response.json();
      setSalesData(data);

      // calculate total revenue and sales based on viewMode
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // months are 0-indexed

      let totalRev = 0;
      let totalQty = 0;

      if (viewMode === "monthly") {
        // filter sales for the current month
        const currentMonthSales = data.filter((sale) => {
          const saleDate = new Date(sale.saleDate);
          return (
            saleDate.getFullYear() === currentYear &&
            saleDate.getMonth() + 1 === currentMonth
          );
        });

        // calculate total revenue and sales for the current month
        totalRev = currentMonthSales.reduce((sum, sale) => sum + parseFloat(sale.revenue), 0);
        totalQty = currentMonthSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      } else {
        // filter sales for the current year
        const currentYearSales = data.filter((sale) => {
          const saleDate = new Date(sale.saleDate);
          return saleDate.getFullYear() === currentYear;
        });

        // calculate total revenue and sales for the current year
        totalRev = currentYearSales.reduce((sum, sale) => sum + parseFloat(sale.revenue), 0);
        totalQty = currentYearSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      }

      setTotalRevenue(totalRev);
      setTotalSales(totalQty);

      // calculate monthly and yearly trends
      if (viewMode === "monthly") {
        const monthly = calculateTrends(data, "month");
        setMonthlyTrends(monthly);
        setTopProducts(calculateTopProducts(data, "month"));
        calculateGrowth(monthly);
      } else {
        const yearly = calculateTrends(data, "year");
        setYearlyTrends(yearly);
        setTopProducts(calculateTopProducts(data, "year"));
        calculateGrowth(yearly);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

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

  // calculate sales growth
  const calculateGrowth = (trends) => {
    if (trends.length < 2) return; // if there are not enough periods to compare, return

    const latestPeriod = trends[trends.length - 1];
    const previousPeriod = trends[trends.length - 2];

    const growth = ((latestPeriod.revenue - previousPeriod.revenue) / previousPeriod.revenue) * 100;
    setSalesGrowth(growth.toFixed(2));
  };

  // fetch sales data on component mount
  useEffect(() => {
    if (session) {
      fetchSalesData();
    }
  }, [session, viewMode]);

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
        <p>You are not authenticated. Please log in to access the sales dashboard.</p>;
      </div>
    );
  }

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

        {/* Profile Button - Desktop */}
        <div className="hidden md:flex justify-end mb-2">
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Sales Analytics Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
          Sales Analytics
          </h1>
          <p className="text-gray-600">View and analyze your sales performance and trends</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-2 mb-4">
          <button
            className={`px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition-all duration-300 ${
              viewMode === "monthly"
                ? "bg-purple-500 text-white shadow-lg hover:bg-purple-400"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("monthly")}
          >
            Monthly View
          </button>
          <button
            className={`px-4 py-2 md:px-6 md:py-3 font-semibold rounded-lg transition-all duration-300 ${
              viewMode === "yearly"
                ? "bg-purple-500 text-white shadow-lg hover:bg-purple-400"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("yearly")}
          >
            Yearly View
          </button>
        </div>

        {/* Sales Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Total Revenue Card */}
          <div className="p-4 md:p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-800 text-md md:text-lg font-bold mb-2">
              {viewMode === "monthly" ? "Monthly Revenue" : "Yearly Revenue"}
            </p>
            <p className="text-xl md:text-2xl font-bold text-green-500">
              Rs. {totalRevenue.toFixed(2)}
            </p>
          </div>

          {/* Sold Items Card */}
          <div className="p-4 md:p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-800 text-md md:text-lg font-bold mb-2">
              {viewMode === "monthly" ? "Monthly Sales" : "Yearly Sales"}
            </p>
            <p className="text-xl md:text-2xl font-bold text-blue-400">
              {totalSales} Items
            </p>
          </div>

          {/* Sales Growth Card */}
          <div className="p-4 md:p-6 bg-white rounded-lg shadow-md text-center">
            <p className="text-gray-800 text-md md:text-lg font-bold mb-2">
              {viewMode === "monthly" ? "Monthly Growth" : "Yearly Growth"}
            </p>
            <p className="text-xl md:text-2xl font-bold text-orange-500">
              {salesGrowth !== null ? `${salesGrowth}%` : "N/A"}
            </p>
          </div>
        </div>

        {/* Sales Trend and Top Products */}
        <div className="mt-6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Sales Trend Chart */}
          <div className="flex-1 p-4 md:p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-md md:text-lg font-semibold text-gray-800 mb-4">
              {viewMode === "monthly" ? "Monthly Sales Trend" : "Yearly Sales Trend"}
            </h2>
            <div className="h-[250px] md:h-[300px]">
              {/* Legend for Chart */}
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === "monthly" ? (
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
                ) : (
                  <BarChart data={yearlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (Rs.)" />
                    <Bar dataKey="quantitySold" fill="#22c55e" name="Items Sold" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 3 Most Sold Products */}
          <div className="w-full lg:w-1/3 p-4 md:p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-md md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrophyIcon className="h-5 md:h-6 w-5 md:w-6 text-yellow-500 mr-2" />
              {viewMode === "monthly"
                ? "Top 3 Products This Month"
                : "Top 3 Products This Year"}
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
        <div className="text-center text-gray-500 text-sm mt-4 md:mt-6">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SalesLayout;