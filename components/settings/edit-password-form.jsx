"use client";

import { useState } from "react";
import { PencilIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { validatePasswordChange } from "@/app/validation/settings";

export default function EditPasswordForm({ userId }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (editMode) setErrors(validatePasswordChange({ ...formData, [name]: value }));
  };

  // validate and change password
  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate form data before submission
    const validationErrors = validatePasswordChange(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      // API call to update password
      const response = await fetch(`/api/settings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordInfo: {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          }
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to change password");
      
      if (data.message === "No changes made. Please make some changes.") {
        toast.info(data.message);
      } else {
        toast.success("Password changed successfully");
        setEditMode(false);
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Password</h2>

        {/* Edit Button */}
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="p-2 text-purple-500 hover:bg-purple-50 rounded-full group relative"
          >
            <PencilIcon className="h-5 w-5" />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-90 transition-opacity whitespace-nowrap">
              Change Password
            </span>
          </button>
        )}
      </div>
      
      {editMode ? (
        // edit mode: show editable form
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.currentPassword ? "border-red-500" : "border-gray-300"} rounded-md pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.newPassword ? "border-red-500" : "border-gray-300"} rounded-md pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-md pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="p-2 text-green-500 hover:bg-green-50 rounded-full group relative"
            >
              <CheckIcon className="h-5 w-5" />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-90 transition-opacity whitespace-nowrap">
                Save Changes
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setFormData({ // clear after saving
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: ""
                });
                setErrors({});
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full group relative"
            >
              <XMarkIcon className="h-5 w-5" />
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-90 transition-opacity whitespace-nowrap">
                Cancel
              </span>
            </button>
          </div>
        </form>
      ) : (
        // view mode: show read-only information
        <div>
          <p className="text-gray-600 text-sm">Click the edit button to change your password</p>
        </div>
      )}
    </div>
  );
}