"use client";

import { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { validateBusinessInfo } from "@/app/validation/settings";

export default function EditBusinessForm({ initialData, userId, onSuccess }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (editMode) setErrors(validateBusinessInfo({ ...formData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateBusinessInfo(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const response = await fetch(`/api/settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo: formData }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      
      toast.success("Business info updated");
      setEditMode(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.businessName ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <input
                type="text"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.businessType ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.businessType && <p className="mt-1 text-sm text-red-600">{errors.businessType}</p>}
            </div>

            {/* Business Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
              <input
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.businessEmail ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.businessEmail && <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.panNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
            </div>
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
                setFormData(initialData);
                setErrors({});
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Business Name</p>
              <p className="text-sm text-gray-900 mt-1">{formData.businessName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Business Type</p>
              <p className="text-sm text-gray-900 mt-1">{formData.businessType || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Business Email</p>
              <p className="text-sm text-gray-900 mt-1">{formData.businessEmail || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">PAN Number</p>
              <p className="text-sm text-gray-900 mt-1">{formData.panNumber || "N/A"}</p>
            </div>
          </div>
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