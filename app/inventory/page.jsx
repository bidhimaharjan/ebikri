'use client';

import { useState } from 'react';
import Navbar from '@/app/components/navbar';
import { UserCircleIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import InventoryForm from '@/app/components/inventory-form'

const InventoryLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const rowsPerPage = 10;

  // Sample inventory data
  const inventoryData = new Array(20).fill({
    id: 'XXX',
    name: 'Lorem Ipsum',
    stock: 'XX',
    price: 'XXXX.XX',
  });

  // calculate pagination
  const totalPages = Math.ceil(inventoryData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = inventoryData.slice(startIndex, endIndex);

  return (
    <div className="flex h-screen">
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        <div className="flex justify-end mb-2">
          <button className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-full">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <span>Lorem Ipsum</span>
          </button>
        </div>

        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Inventory</h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button 
            className="h-10 px-4 py-2 bg-red-500 text-white text-sm rounded-md flex items-center"
            onClick={() => setIsFormOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-1" /> Add
          </button>
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search a product..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <button className="ml-2 h-10 px-4 py-2 bg-red-500 text-white text-sm rounded-md">Search</button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Stock Availability</th>
                <th className="px-4 py-2">Unit Price</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.stock}</td>
                  <td className="px-4 py-2">{item.price}</td>
                  <td className="px-4 py-2 flex justify-center space-x-2">
                    <button className="px-4 py-1 text-sm bg-green-600 text-white rounded-md">Edit</button>
                    <button className="px-4 py-1 text-sm bg-red-500 text-white rounded-md">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        <div className="text-center text-gray-500 text-sm mt-2">
          ©2025 eBikri. All Rights Reserved
        </div>

        {/* Pop-up form */}
        {isFormOpen && <InventoryForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />}
      </div>
    </div>
  );
};

export default InventoryLayout;
