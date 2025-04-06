"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CreditCardIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AddOrderForm from "@/components/orders/add-order-form";
import EditOrderForm from "@/components/orders/edit-order-form";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";
import Pagination from "@/components/pagination";
import PaymentDetails from "@/components/payments/payment-details";
import ConfirmationDialog from "@/components/confirmation-dialog";
import Link from 'next/link';

const OrdersLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOrderFormOpen, setIsAddOrderFormOpen] = useState(false);
  const [isEditOrderFormOpen, setIsEditOrderFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // track selected order ID
  const [orderToEdit, setOrderToEdit] = useState(null); // track order to edit
  const [orderToDelete, setOrderToDelete] = useState(null); // track order to delete
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false); // confirmation dialog state
  const rowsPerPage = 3;

  // fetch order data
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/api/orders?businessId=${session.user.businessId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  // handle payments button click
  const handlePayments = (orderId) => {
    setSelectedOrderId(orderId); // set the selected order ID
  };

  // handle edit button click
  const handleEdit = (order) => {
    console.log("Order to edit:", order); // Add this line
    setOrderToEdit(order); // track selected order ID
    setIsEditOrderFormOpen(true);
  };

  // handle delete button click
  const handleDeleteClick = (orderId) => {
    setOrderToDelete(orderId); // set the order to delete
    setIsConfirmationDialogOpen(true); // open the confirmation dialog
  };

  // handle order deletion
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/orders/${orderToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      const data = await response.json();
      toast.success(data.message); // show success message
      fetchOrders(); // refresh the orders list
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setIsConfirmationDialogOpen(false); // close the confirmation dialog
      setOrderToDelete(null); // reset the order to delete
    }
  };

  // filter orders based on search query
  const filteredOrders = orders
    .filter((item) => {
      const orderIdMatch = item.id.toString().includes(searchQuery);
      const customerIdMatch = item.customer?.id
        .toString()
        .includes(searchQuery);
      const customerNameMatch = item.customer?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const orderDateMatch = new Date(item.orderDate)
        .toLocaleDateString()
        .includes(searchQuery);

      return (
        orderIdMatch || customerIdMatch || customerNameMatch || orderDateMatch
      );
    })
    .sort((a, b) => a.id - b.id);

  // calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

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
          <Link href="/profile">
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Orders and Payments Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Orders and Payments
          </h1>
          <p className="text-gray-600">Manage and track customer orders and payments information</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* New Order Button */}
          <button
            className="h-10 px-4 py-2 bg-purple-500 text-white text-sm rounded-md flex items-center hover:bg-purple-400"
            onClick={() => setIsAddOrderFormOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> New Order
          </button>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search an order..."
                className="w-full h-10 px-4 pl-10 py-2 text-sm border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-800 text-lg text-center border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Customer Details</th>
                <th className="px-4 py-2">Order Details</th>
                <th className="px-4 py-2">Total Amount</th>
                <th className="px-4 py-2">Discount</th>
                <th className="px-4 py-2">Order Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders
                .slice(
                  (currentPage - 1) * rowsPerPage,
                  currentPage * rowsPerPage
                )
                .map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2 text-center">{item.id}</td>

                    <td className="px-4 py-2">
                      <div className="space-y-1">
                        <div>
                          <strong>Cust. ID:</strong> {item.customer?.id}
                        </div>
                        <div>
                          <strong>Name:</strong> {item.customer?.name}
                        </div>
                        <div>
                          <strong>Email:</strong> {item.customer?.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {item.customer?.phoneNumber}
                        </div>
                        <div>
                          <strong>Delivery:</strong> {item.deliveryLocation}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2 ">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="px-2">Prod. ID</th>
                            <th className="px-2">Quantity</th>
                            <th className="px-2">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.products.map((product) => (
                            <tr key={product.productId} className="text-center">
                              <td>{product.productId}</td>
                              <td>{product.quantity}</td>
                              <td>{product.unitPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>

                    <td className="px-4 py-2 text-center">
                      {item.totalAmount}
                    </td>

                    <td className="px-4 py-2 text-center">
                      Rs. {item.discountAmount}
                      {item.discountAmount > 0 && (
                        <div className="text-green-600">
                          ({item.discountPercent}%)
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-2 text-center">
                      {new Date(item.orderDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex justify-center items-center space-x-2 h-full">
                        {/* Payments Button */}
                        <button
                          className="px-4 py-1 text-sm bg-green-500 text-white rounded-md flex items-center hover:bg-green-600"
                          onClick={() => handlePayments(item.id)}
                        >
                          <CreditCardIcon className="h-4 w-4 mr-1" /> Payments
                        </button>

                        {/* Edit Button */}
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

                        {/* Delete Button */}
                        <div className="relative group">
                          <button
                            className="p-1 border border-red-500 rounded-md text-red-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteClick(item.id)}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Delete
                          </span>
                        </div>
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
          data={filteredOrders}
        />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2">
          ©2025 eBikri. All Rights Reserved
        </div>

        {/* Add Order Form */}
        {isAddOrderFormOpen && (
          <AddOrderForm
            isOpen={isAddOrderFormOpen}
            onClose={() => setIsAddOrderFormOpen(false)}
            onConfirm={fetchOrders} // refresh data
          />
        )}

        {/* Edit Order Form */}
        {isEditOrderFormOpen && (
          <EditOrderForm
            isOpen={isEditOrderFormOpen}
            onClose={() => setIsEditOrderFormOpen(false)}
            onConfirm={fetchOrders} // refresh data
            order={orderToEdit} // pass the order data to edit
          />
        )}

        {/* Render PaymentDetails component if an order is selected */}
        {selectedOrderId && (
          <PaymentDetails
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)} // close the modal
          />
        )}

        {/* Confirmation Dialog for Delete */}
        {isConfirmationDialogOpen && (
          <ConfirmationDialog
            isOpen={isConfirmationDialogOpen}
            onClose={() => setIsConfirmationDialogOpen(false)}
            onConfirm={handleDelete}
            message="Are you sure you want to delete this order?"
          />
        )}
      </div>
    </div>
  );
};

export default OrdersLayout;
