"use client";

import { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { validatePersonalInfo } from "@/app/validation/settings";

export default function EditPersonalForm({ initialData, userId, onSuccess }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (editMode) setErrors(validatePersonalInfo({ ...formData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validatePersonalInfo(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    try {
      const response = await fetch(`/api/settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalInfo: formData }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      
      toast.success("Personal info updated");
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
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.phoneNumber ? "border-red-500" : "border-gray-300"} rounded-md`}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
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
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-sm text-gray-900 mt-1">{formData.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-sm text-gray-900 mt-1">{formData.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-sm text-gray-900 mt-1">{formData.phoneNumber}</p>
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