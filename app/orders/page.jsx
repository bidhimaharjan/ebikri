'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Navbar from '@/app/components/navbar';
import { UserCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddOrderForm from '@/app/components/orders/add-order-form'

const OrdersLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOrderFormOpen, setIsAddOrderFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // state for search query
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const rowsPerPage = 10; // pagination setup

  // fetch order data
  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders?businessId=${session.user.businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };
  
  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  // filter orders based on search query
  const filteredOrders = orders.filter((item) =>
    item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toString().includes(searchQuery)
  );

  // calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredOrders.slice(startIndex, endIndex);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>You are not authenticated. Please log in to access the inventory.</p>;
  }

  return (
    <div className="flex h-screen">
      {/* Navigation Bar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button */}
        <div className="flex justify-end mb-2">
          <button className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-full">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <span>{session.user.name}</span>
          </button>
        </div>

        {/* Orders and Payments Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Orders and Payments</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* New Order Button */}
          <button 
            className="h-10 px-4 py-2 bg-red-500 text-white text-sm rounded-md flex items-center hover:bg-red-600"
            onClick={() => setIsAddOrderFormOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-1" /> New Order
          </button>
          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search an order..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // update search query
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <button 
              className="ml-2 h-10 px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              onClick={() => setSearchQuery('')} // clear search query
            >
              Search
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer Details</th>
                <th className="px-4 py-2">Order Details</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Order Date</th>
                <th className="px-4 py-2">Payments</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.productName}</td>
                  <td className="px-4 py-2">{item.stockAvailability}</td>
                  <td className="px-4 py-2">{item.unitPrice}</td>
                  <td className="px-4 py-2 flex justify-center space-x-2">
                    {/* Edit Order Button */}
                    <button 
                    className="px-4 py-1 text-sm bg-green-600 text-white rounded-md"
                    onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    {/* Delete Order Button */}
                    <button 
                    className="px-4 py-1 text-sm bg-red-500 text-white rounded-md"
                    onClick={() => {
                      setProductToDelete(item.id); // set the order ID to delete
                      setIsConfirmationDialogOpen(true); // open the confirmation dialog
                    }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className={`p-2 bg-gray-500 text-white rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md text-sm font-bold ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'text-gray-800'}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className={`p-2 bg-gray-500 text-white rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2">
          ©2025 eBikri. All Rights Reserved
        </div>

        {/* Add Order Form */}
        {isAddOrderFormOpen && (
          <AddOrderForm
            isOpen={isAddOrderFormOpen}
            onClose={() => setIsAddOrderFormOpen(false)}
          />
        )}

      </div>
    </div>
  );
};

export default OrdersLayout;
