"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AddCustomerForm from "@/components/customers/add-customer-form";
import EditCustomerForm from "@/components/customers/edit-customer-form";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";
import Pagination from "@/components/pagination";
import Link from 'next/link';

const CustomersLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // track the selected product for editing
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false); // state for confirmation dialog
  const [customerToDelete, setCustomerToDelete] = useState(null); // track the customer ID to delete
  const [searchQuery, setSearchQuery] = useState(""); // state for search query
  const { data: session, status } = useSession();
  const [customer, setCustomer] = useState([]);
  const rowsPerPage = 8; // pagination setup

  // fetch customer data
  const fetchCustomer = async () => {
    try {
      const response = await fetch(
        `/api/customers?businessId=${session.user.businessId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch customer");
      }
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  // fetch customer data on component mount
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
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Customer deleted successfully!");
        fetchCustomer(); // refresh the customer data
      } else {
        toast.error("Error deleting customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  // filter customer based on search query
  const filteredCustomer = customer
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery) ||
        item.phoneNumber.toString().includes(searchQuery)
    )
    .sort((a, b) => a.id - b.id);

  // calculate total pages
  const totalPages = Math.ceil(filteredCustomer.length / rowsPerPage);

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
        <p>You are not authenticated. Please log in to access the customers.</p>
      </div>
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
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Customers Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Customers
          </h1>
          <p className="text-gray-600">Manage your customer information</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* Add Customer Button */}
          <button
            className="h-10 px-4 py-2 bg-purple-500 text-white text-sm rounded-md flex items-center hover:bg-purple-400"
            onClick={() => setIsAddFormOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add
          </button>
          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search a customer..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // update search query
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-800 text-lg text-left border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer Name</th>
                <th className="px-4 py-2">Phone Number</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 text-center">Added Date</th>
                <th className="px-4 py-2 text-center">Total Orders</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomer
                .slice(
                  (currentPage - 1) * rowsPerPage,
                  currentPage * rowsPerPage
                )
                .map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{item.id}</td>
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.phoneNumber}</td>
                    <td className="px-4 py-2">{item.email}</td>
                    <td className="px-4 py-2 text-center">{item.addedDate}</td>
                    <td className="px-4 py-2 text-center">
                      {item.totalOrders}
                    </td>
                    <td className="px-4 py-2 flex justify-center space-x-2">
                      {/* Edit Customer Button */}
                      <div className="relative group">
                        <button
                          className="p-1 border border-blue-300 rounded-md text-blue-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50"
                          onClick={() => handleEdit(item)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Edit
                        </span>
                      </div>

                      {/* Delete Customer Button */}
                      <div className="relative group">
                        <button
                          className="p-1 border border-red-500 rounded-md text-red-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50"
                          onClick={() => {
                            setCustomerToDelete(item.id); // set the customer ID to delete
                            setIsConfirmationDialogOpen(true); // open the confirmation dialog
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Delete
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          data={filteredCustomer}
        />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>

        {/* Add Customer Form */}
        {isAddFormOpen && (
          <AddCustomerForm
            isOpen={isAddFormOpen}
            onClose={() => setIsAddFormOpen(false)}
            onConfirm={fetchCustomer} // refresh data
          />
        )}

        {/* Edit Customer Form */}
        {isEditFormOpen && (
          <EditCustomerForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            customer={selectedCustomer}
            onConfirm={fetchCustomer} // refresh data
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
