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
import AddProductForm from "@/components/inventory/add-product-form";
import EditProductForm from "@/components/inventory/edit-product-form";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";
import Pagination from "@/components/pagination";

const InventoryLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // track the selected product for editing
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false); // state for confirmation dialog
  const [productToDelete, setProductToDelete] = useState(null); // track the product ID to delete
  const [searchQuery, setSearchQuery] = useState(""); // state for search query
  const { data: session, status } = useSession();
  const [inventory, setInventory] = useState([]);
  const rowsPerPage = 9; // pagination setup

  // fetch inventory data
  const fetchInventory = async () => {
    try {
      const response = await fetch(
        `/api/inventory?businessId=${session.user.businessId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch inventory");
      }
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchInventory();
    }
  }, [session]);

  // handle Edit button click
  const handleEdit = (product) => {
    setSelectedProduct(product); // set the selected product
    setIsEditFormOpen(true); // open the edit form
  };

  // handle Delete button click
  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`/api/inventory/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully!");
        fetchInventory(); // refresh the inventory data
      } else {
        toast.error("Error deleting product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // filter inventory based on search query
  const filteredInventory = inventory
    .filter(
      (item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery)
    )
    .sort((a, b) => a.id - b.id);

  // calculate total pages
  const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

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
      {/* Navigation Bar */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-10 overflow-y-auto">
        {/* Profile Button */}
        <div className="flex justify-end mb-2">
          <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <BusinessName userId={session.user.id} />
          </button>
        </div>

        {/* Inventory Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Inventory
          </h1>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* Add Product Button */}
          <button
            className="h-10 px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-md flex items-center hover:bg-purple-400"
            onClick={() => setIsAddFormOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Add
          </button>
          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search a product..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // update search query
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-800 text-left text-lg border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2 text-center">Stock Availability</th>
                <th className="px-4 py-2 text-center">Unit Price</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory
                .slice(
                  (currentPage - 1) * rowsPerPage,
                  currentPage * rowsPerPage
                )
                .map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{item.id}</td>
                    <td className="px-4 py-2">{item.productName}</td>
                    <td className="px-4 py-2 text-center">{item.stockAvailability}</td>
                    <td className="px-4 py-2 text-center">{item.unitPrice}</td>
                    <td className="px-4 py-2 flex justify-center space-x-2">
                      {/* Edit Product Button */}
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

                      {/* Delete Product Button */}
                      <div className="relative group">
                        <button
                          className="p-1 border border-red-500 rounded-md text-red-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50"
                          onClick={() => {
                            setProductToDelete(item.id); // set the product ID to delete
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
          data={filteredInventory}
        />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2">
          ©2025 eBikri. All Rights Reserved
        </div>

        {/* Add Product Form */}
        {isAddFormOpen && (
          <AddProductForm
            isOpen={isAddFormOpen}
            onClose={() => setIsAddFormOpen(false)}
            onConfirm={fetchInventory} // refresh data
          />
        )}

        {/* Edit Product Form */}
        {isEditFormOpen && (
          <EditProductForm
            isOpen={isEditFormOpen}
            onClose={() => setIsEditFormOpen(false)}
            onConfirm={fetchInventory} // refresh data
            product={selectedProduct}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
          onConfirm={() => {
            handleDelete(productToDelete); // call handleDelete with the product ID
            setIsConfirmationDialogOpen(false); // close the dialog
          }}
          message="Are you sure you want to delete this product?"
        />
      </div>
    </div>
  );
};

export default InventoryLayout;
