"use client";

import { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export default function EditPaymentForm({ hasPaymentSecret, userId, onSuccess }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ liveSecretKey: "" });
  const [showSecretKey, setShowSecretKey] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.liveSecretKey) {
      toast.error("Please enter your Live Secret Key");
      return;
    }

    try {
      const response = await fetch(`/api/settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentInfo: {
            liveSecretKey: formData.liveSecretKey,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update payment information");

      toast.success(
        hasPaymentSecret
          ? "Payment key updated successfully"
          : "Payment integration activated successfully"
      );
      setEditMode(false);
      setFormData({ liveSecretKey: "" });
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khalti Live Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                name="liveSecretKey"
                value={formData.liveSecretKey}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecretKey ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              This key will be securely stored and used for Khalti payments.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="p-2 text-green-500 hover:bg-green-50 rounded-full"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({ liveSecretKey: "" });
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center">
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                hasPaymentSecret ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            <p className="text-gray-800 font-medium">
              {hasPaymentSecret
                ? "Khalti payment activated"
                : "Khalti payment inactive"}
            </p>
          </div>
          <p className="text-sm text-gray-600">
            {hasPaymentSecret
              ? "Your Khalti payment integration is active"
              : "Add your Khalti Live Secret Key to enable payments"}
          </p>
          <button
            onClick={() => setEditMode(true)}
            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}