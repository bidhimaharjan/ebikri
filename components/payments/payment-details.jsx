"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const PaymentDetails = ({ orderId, onClose }) => {
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");

  // fetch payment details when the component mounts
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payment/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch payment details");
        }
        const data = await response.json();
        setPayment(data);
        setSelectedStatus(data.status); // Set the initial status
      } catch (error) {
        console.error("Error fetching payment details:", error);
        toast.error("Failed to fetch payment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  // handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/payment/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const updatedPayment = await response.json();
      setPayment(updatedPayment);
      toast.success("Payment status updated successfully!");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  // if there's no orderId, don't render the modal
  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <p>No payment details found for this order.</p>
        </div>
      </div>
    );
  }

  // determine the status color based on the payment status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 border-green-500 text-green-700";
      case "failed":
        return "bg-red-100 border-red-500 text-red-700";
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <div className="space-y-4">
          {/* Payment ID */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Payment ID:</span>
            <span className="text-sm">{payment.id}</span>
          </div>

          {/* Order ID */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Order ID:</span>
            <span className="text-sm">{payment.orderId}</span>
          </div>

          {/* Amount */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Amount:</span>
            <span className="text-sm">{payment.amount}</span>
          </div>

          {/* Status */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Status:</span>
            <span
              className={`text-sm px-2 py-1 rounded border ${getStatusColor(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Payment Method:</span>
            <span className="text-sm">{payment.paymentMethod}</span>
          </div>

          {/* Payment Date */}
          <div className="flex justify-between">
            <span className="text-sm font-medium">Payment Date:</span>
            <span className="text-sm">{payment.paymentDate}</span>
          </div>

          {/* Transaction ID (if available) */}
          {payment.transactionId && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Transaction ID:</span>
              <span className="text-sm">{payment.transactionId}</span>
            </div>
          )}

          {/* Manual Status Update (only for "Other" payment method) */}
          {payment.paymentMethod === "Other" && (
            <div className="mt-4">
              <label className="block text-sm text-center font-medium mb-2">
                Update Payment Status
              </label>
              <div className="flex items-center gap-3 w-full">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 p-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
                <button
                  onClick={() => handleStatusChange(selectedStatus)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-sm text-white rounded-md hover:bg-blue-600"
                >
                  Update Status
                </button>
              </div>
            </div>
          )}


        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;