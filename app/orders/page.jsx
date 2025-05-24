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
  Bars3Icon,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddOrderFormOpen, setIsAddOrderFormOpen] = useState(false);
  const [isEditOrderFormOpen, setIsEditOrderFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null); // track selected order ID
  const [orderToEdit, setOrderToEdit] = useState(null); // track order to edit
  const [orderToDelete, setOrderToDelete] = useState(null); // track order to delete
  const [hasPaymentSecret, setHasPaymentSecret] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false); // confirmation dialog state
  const rowsPerPage = 3;

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

  // function to fetch order data
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

  // function to check if payment secret exists for this user
  const checkPaymentSecret = async () => {
    try {
      const response = await fetch('/api/payment/check-secret');
      if (response.ok) {
        const data = await response.json();
        // update state to show if payment secret exists
        setHasPaymentSecret(data.hasSecret);
      }
    } catch (error) {
      console.error("Error checking payment secret:", error);
    }
  };

  // fetch order data and payment secret on component mount
  useEffect(() => {
    if (session) {
      fetchOrders();
      checkPaymentSecret();
    }
  }, [session]);

  // handle payments button click
  const handlePayments = (orderId) => {
    setSelectedOrderId(orderId); // set the selected order ID
  };

  // handle edit button click
  const handleEdit = (order) => {
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

      const data = await response.json();

      if (!response.ok) {
        // handle paid orders error with a toast
        toast.error(data.message || data.error || "Failed to delete order");
        return;
      }

      toast.success(data.message); // show success message
      fetchOrders(); // refresh the orders list
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error.message || "Failed to delete order");
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
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the inventory.</p>
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

        {/* Orders and Payments Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Orders and Payments
          </h1>
          <p className="text-gray-600">Manage and track customer orders and payments information</p>
        </div>

        {/* Search and Add Order */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 md:gap-0">
          {/* New Order Button */}
          <button
            className="w-full md:w-auto h-10 px-4 py-2 bg-purple-500 text-white text-sm rounded-md flex items-center justify-center hover:bg-purple-400"
            onClick={() => setIsAddOrderFormOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> 
            <span className="md:hidden">New Order</span>
            <span className="hidden md:inline">New Order</span>
          </button>

          {/* Search Bar */}
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Search an order..."
              className="w-full h-10 px-4 pl-10 py-2 text-sm border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>

          {/* Configure Payment Button (only shown when payment secret is missing) */}
          {!hasPaymentSecret && (
            <Link href="/settings" passHref>
              <button className="w-full md:w-auto h-10 px-4 py-2 bg-purple-500 text-white text-sm rounded-md flex items-center justify-center hover:bg-purple-400">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                <span className="md:hidden">Configure</span>
                <span className="hidden md:inline">Configure Payment</span>
              </button>
            </Link>
          )}
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full min-w-[800px] md:min-w-full border-collapse">
            <thead>
              <tr className="text-gray-800 text-center border-b">
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
                  <tr key={item.id} className="border-b text-sm">
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
                      Rs. {(+item.discountAmount).toFixed(2)}
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
        <div className="text-center text-gray-500 text-sm mt-6">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
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
