"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import {
  UserCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import BusinessName from "@/components/businessname";
import Link from "next/link";
import {
  validatePersonalInfo,
  validateBusinessInfo,
  validatePasswordChange,
} from "@/app/validation/settings";

const SettingsLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // state for all user data
  const [userData, setUserData] = useState({
    personalInfo: {
      name: "",
      email: "",
      phoneNumber: "",
    },
    businessInfo: {
      businessName: "",
      businessType: "",
      businessEmail: "",
      panNumber: "",
    },
  });

  // edit states
  const [editPersonal, setEditPersonal] = useState(false);
  const [editBusiness, setEditBusiness] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  // password change state
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // error states
  const [personalErrors, setPersonalErrors] = useState({});
  const [businessErrors, setBusinessErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/settings/${session.user.id}`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch user data");
          }

          const data = await response.json();

          setUserData({
            personalInfo: {
              name: data.user?.name || "",
              email: data.user?.email || "",
              phoneNumber: data.user?.phoneNumber || "",
            },
            businessInfo: {
              businessName: data.business?.businessName || "",
              businessType: data.business?.businessType || "",
              businessEmail: data.business?.businessEmail || "",
              panNumber: data.business?.panNumber || "",
            },
          });
        } catch (error) {
          toast.error("Failed to load user data");
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  // handle changes in personal fields
  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    const updatedPersonalInfo = {
      ...userData.personalInfo,
      [name]: value,
    };

    setUserData((prev) => ({
      ...prev,
      personalInfo: updatedPersonalInfo,
    }));

    if (editPersonal) {
      setPersonalErrors(validatePersonalInfo(updatedPersonalInfo));
    }
  };

  // handle changes in business fields
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    const updatedBusinessInfo = {
      ...userData.businessInfo,
      [name]: value,
    };

    setUserData((prev) => ({
      ...prev,
      businessInfo: updatedBusinessInfo,
    }));

    if (editBusiness) {
      setBusinessErrors(validateBusinessInfo(updatedBusinessInfo));
    }
  };

  // handle changes in password fields
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const updatedPasswordInfo = {
      ...passwordInfo,
      [name]: value,
    };

    setPasswordInfo(updatedPasswordInfo);

    if (editPassword) {
      setPasswordErrors(validatePasswordChange(updatedPasswordInfo));
    }
  };

  // validate and save personal information
  const savePersonalInfo = async () => {
    const errors = validatePersonalInfo(userData.personalInfo);
    setPersonalErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo: userData.personalInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update personal information");
      }

      if (data.message === "No changes made. Please make some changes.") {
        toast.info(data.message);
      } else {
        toast.success("Personal information updated successfully");
        setEditPersonal(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // validate and save business information
  const saveBusinessInfo = async () => {
    try {
      const errors = validateBusinessInfo(userData.businessInfo);
      setBusinessErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      const response = await fetch(`/api/settings/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessInfo: userData.businessInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update business information");
      }

      if (data.message === "No changes made. Please make some changes.") {
        toast.info(data.message);
      } else {
        toast.success("Business information updated successfully");
        setEditBusiness(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // validate and change password
  const changePassword = async () => {
    const errors = validatePasswordChange(passwordInfo);
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const response = await fetch(`/api/settings/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passwordInfo: {
            currentPassword: passwordInfo.currentPassword,
            newPassword: passwordInfo.newPassword,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      if (data.message === "No changes made. Please make some changes.") {
        toast.info(data.message);
      } else {
        toast.success("Password changed successfully");
        setPasswordInfo({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setEditPassword(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // handle edit button clicks
  const handleEditPersonal = () => {
    setPersonalErrors({});
    setEditPersonal(true);
  }; 
  const handleEditBusiness = () => {
    setBusinessErrors({});
    setEditBusiness(true);
  };
  const handleEditPassword = () => {
    setPasswordErrors({});
    setEditPassword(true);
  };

  // handle cancel button clicks
  const cancelEditPersonal = () => {
    setPersonalErrors({});
    setEditPersonal(false);
  };
  const cancelEditBusiness = () => {
    setBusinessErrors({});
    setEditBusiness(false);
  };
  const cancelEditPassword = () => {
    setPasswordErrors({});
    setEditPassword(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the settings.</p>
      </div>
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

        {/* Settings Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account and business information
          </p>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Personal Information
            </h2>

            {editPersonal ? (
              <div className="flex space-x-2">
                {/* Save Button */}
                <button
                  onClick={savePersonalInfo}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full group relative"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Save Changes
                  </span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={cancelEditPersonal}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full group relative"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Cancel
                  </span>
                </button>
              </div>
            ) : (
              // {/* Edit Button */}
              <button
                onClick={handleEditPersonal}
                className="p-2 text-purple-500 hover:bg-purple-50 rounded-full group relative"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Edit Personal Info
                </span>
              </button>
            )}
          </div>

          {/* Personal Information Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              {editPersonal ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={userData.personalInfo.name}
                    onChange={handlePersonalChange}
                    className={`w-full p-2 border ${personalErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {personalErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{personalErrors.name}</p>
                  )}
                </>
              ) : (
                <p className="p-2 bg-gray-50 rounded-md">
                  {userData.personalInfo.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {editPersonal ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={userData.personalInfo.email}
                    onChange={handlePersonalChange}
                    className={`w-full p-2 border ${personalErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {personalErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{personalErrors.email}</p>
                  )}
                </>
              ) : (
                <p className="p-2 bg-gray-50 rounded-md">
                  {userData.personalInfo.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {editPersonal ? (
                <>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.personalInfo.phoneNumber}
                    onChange={handlePersonalChange}
                    className={`w-full p-2 border ${personalErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                  />
                  {personalErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{personalErrors.phoneNumber}</p>
                  )}
                </>
              ) : (
                <p className="p-2 bg-gray-50 rounded-md">
                  {userData.personalInfo.phoneNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Business Information
            </h2>

            {editBusiness ? (
              <div className="flex space-x-2">
                {/* Save Button */}
                <button
                  onClick={saveBusinessInfo}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full group relative"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Save Changes
                  </span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={cancelEditBusiness}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full group relative"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Cancel
                  </span>
                </button>
              </div>
            ) : (
              // {/* Edit Button */}
              <button
                onClick={handleEditBusiness}
                className="p-2 text-purple-500 hover:bg-purple-50 rounded-full group relative"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Edit Business Info
                </span>
              </button>
            )}
          </div>

          {/* Business Information Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                {editBusiness ? (
                  <>
                    <input
                      type="text"
                      name="businessName"
                      value={userData.businessInfo.businessName}
                      onChange={handleBusinessChange}
                      className={`w-full p-2 border ${businessErrors.businessName ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    />
                    {businessErrors.businessName && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.businessName}</p>
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">
                    {userData.businessInfo.businessName || "N/A"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                {editBusiness ? (
                  <>
                    <input
                      type="text"
                      name="businessType"
                      value={userData.businessInfo.businessType}
                      onChange={handleBusinessChange}
                      className={`w-full p-2 border ${businessErrors.businessType ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    />
                    {businessErrors.businessType && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.businessType}</p>
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">
                    {userData.businessInfo.businessType || "N/A"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                {editBusiness ? (
                  <>
                    <input
                      type="email"
                      name="businessEmail"
                      value={userData.businessInfo.businessEmail}
                      onChange={handleBusinessChange}
                      className={`w-full p-2 border ${businessErrors.businessEmail ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    />
                    {businessErrors.businessEmail && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.businessEmail}</p>
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">
                    {userData.businessInfo.businessEmail || "N/A"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                {editBusiness ? (
                  <>
                    <input
                      type="text"
                      name="panNumber"
                      value={userData.businessInfo.panNumber}
                      onChange={handleBusinessChange}
                      className={`w-full p-2 border ${businessErrors.panNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    />
                    {businessErrors.panNumber && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.panNumber}</p>
                    )}
                  </>
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">
                    {userData.businessInfo.panNumber || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Password</h2>

            {editPassword ? (
              <div className="flex space-x-2">
                {/* Save Button */}
                <button
                  onClick={changePassword}
                  className="p-2 text-green-500 hover:bg-green-50 rounded-full group relative"
                >
                  <CheckIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Save Changes
                  </span>
                </button>

                {/* Cancel Button */}
                <button
                  onClick={cancelEditPassword}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full group relative"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Cancel
                  </span>
                </button>
              </div>
            ) : (
              // {/* Edit Button */}
              <button
                onClick={handleEditPassword}
                className="p-2 text-purple-500 hover:bg-purple-50 rounded-full group relative"
              >
                <PencilIcon className="h-5 w-5" />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Change Password
                </span>
              </button>
            )}
          </div>

          {/* Password Fields */}
          {editPassword ? (
            <div className="space-y-4">
              {/* Current Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordInfo.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-2 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10`}
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
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordInfo.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-2 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10`}
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
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordInfo.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full p-2 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md pr-10`}
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
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              Click the edit button to change your password
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-6">
          ©2025 eBikri. All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
