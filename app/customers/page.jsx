"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import AddCustomerForm from '@/components/customers/add-customer-form'
import EditCustomerForm from '@/components/customers/edit-customer-form'
import ConfirmationDialog from "@/components/confirmation-dialog";

const CustomersLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // track the selected product for editing
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false); // state for confirmation dialog
  const [customerToDelete, setCustomerToDelete] = useState(null); // track the customer ID to delete
  const [searchQuery, setSearchQuery] = useState(""); // state for search query
  const { data: session, status } = useSession();
  const [customer, setCustomer] = useState([]);
  const rowsPerPage = 10; // pagination setup

  // fetch customer data
  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers?businessId=${session.user.businessId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCustomer();
    }
  }, [session]);

  // handle Edit button click
  const handleEdit = (customer) => {
    setSelectedCustomer(customer); // set the selected customer
    setIsEditFormOpen(true); // open the edit form
  };

  // handle Delete button click
  const handleDelete = async (customerId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Customer deleted successfully!');
        fetchCustomer(); // refresh the customer data
      } else {
        alert('Error deleting customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // filter customer based on search query
  const filteredCustomer = customer.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery) ||
      item.phoneNumber.toString().includes(searchQuery)
  );

  // calculate pagination
  const totalPages = Math.ceil(filteredCustomer.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredCustomer.slice(startIndex, endIndex);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <p>You are not authenticated. Please log in to access the inventory.</p>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Navbar */}
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

        {/* Customers Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Customers
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* Add Customer Button */}
          <button
            className="h-10 px-4 py-2 bg-white text-blue-500 text-sm font-semibold rounded-md border border-blue-500 flex items-center hover:bg-blue-500 hover:text-white"
            onClick={() => setIsAddFormOpen(true)}
          >
            <PlusIcon className="h-5 w-5 mr-1" /> Add
          </button>
          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search a customer..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // update search query
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <button
              className="ml-2 h-10 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
              onClick={() => setSearchQuery("")} // clear search query
            >
              Search
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Added Date</th>
                <th className="px-4 py-2">Total Orders</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.phoneNumber}</td>
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item.addedDate}</td>
                  <td className="px-4 py-2">{item.totalOrders}</td>
                  <td className="px-4 py-2 flex justify-center space-x-2">
                    {/* Edit Customer Button */}
                    <button
                      className="px-4 py-1 text-sm bg-gray-200 text-black rounded-md hover:bg-gray-400"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    {/* Delete Delete Button */}
                    <button
                      className="px-4 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => {
                        setCustomerToDelete(item.id); // set the customer ID to delete
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
            className={`p-2 text-white-200 rounded-md ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-md text-sm font-bold ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "text-gray-800"
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className={`p-2 text-white-200 rounded-md ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
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

        {/* Add Customer Form */}
        {isAddFormOpen && (
          <AddCustomerForm
            isOpen={isAddFormOpen}
            onClose={() => setIsAddFormOpen(false)}
          />
        )}

        {/* Edit Customer Form */}
        {isEditFormOpen && (
          <EditCustomerForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            customer={selectedCustomer}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
          onConfirm={() => {
            handleDelete(customerToDelete); // call handleDelete with the customer ID
            setIsConfirmationDialogOpen(false); // close the dialog
          }}
          message="Are you sure you want to delete this customer?"
        />
      </div>
    </div>
  );
};

export default CustomersLayout;
