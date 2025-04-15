import { useState } from 'react';
import { toast } from 'react-toastify';
import { validateCampaignForm } from '@/app/validation/marketing';

const AddCampaignForm = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    campaignName: '',
    discountPercent: '',
    promoCode: '',
    recipientType: 'all',
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate form
    const validationErrors = validateCampaignForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountPercent: parseFloat(formData.discountPercent),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Campaign created successfully!");
        onClose();
        onConfirm();
        setFormData({
          campaignName: "",
          discountPercent: "",
          promoCode: "",
          recipientType: "all",
          startDate: "",
          endDate: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error creating campaign");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast.error("Failed to create campaign");
    }
  };

  const generatePromoCode = () => {
    const randomCode = `${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setFormData(prev => ({ ...prev, promoCode: randomCode }));
    if (errors.promoCode) {
      setErrors(prev => ({ ...prev, promoCode: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[450px]">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Create Campaign</h2>
        <form onSubmit={handleSubmit}>
          {/* Campaign Name Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Campaign Name *</label>
            <input
              type="text"
              name="campaignName"
              className={`w-full p-2 mt-1 text-sm border ${
                errors.campaignName ? 'border-red-500' : 'border-gray-400'
              } rounded`}
              value={formData.campaignName}
              onChange={handleChange}
            />
            {errors.campaignName && (
              <p className="mt-1 text-xs text-red-500">{errors.campaignName}</p>
            )}
          </div>

          {/* Discount Percent Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Discount % *</label>
            <input
              type="number"
              name="discountPercent"
              className={`w-full p-2 mt-1 text-sm border ${
                errors.discountPercent ? 'border-red-500' : 'border-gray-400'
              } rounded`}
              value={formData.discountPercent}
              onChange={handleChange}
            />
            {errors.discountPercent && (
              <p className="mt-1 text-xs text-red-500">{errors.discountPercent}</p>
            )}
          </div>

          <div className="mb-4 flex space-x-4">
            {/* Start Date Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date *</label>
              <input
                type="date"
                name="startDate"
                className={`w-full p-2 mt-1 text-sm border ${
                  errors.startDate ? 'border-red-500' : 'border-gray-400'
                } rounded`}
                value={formData.startDate}
                onChange={handleChange}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date Field */}
            <div className="flex-1">
              <label className="block text-sm font-medium">End Date *</label>
              <input
                type="date"
                name="endDate"
                className={`w-full p-2 mt-1 text-sm border ${
                  errors.endDate ? 'border-red-500' : 'border-gray-400'
                } rounded`}
                value={formData.endDate}
                onChange={handleChange}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Recipients Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Recipients *</label>
            <select
              name="recipientType"
              className={`w-full p-2 mt-1 text-sm border ${
                errors.recipientType ? 'border-red-500' : 'border-gray-400'
              } rounded`}
              value={formData.recipientType}
              onChange={handleChange}
            >
              <option value="all">All Customers</option>
              {/* <option value="selected">Selected Customers</option> */}
            </select>
            {errors.recipientType && (
              <p className="mt-1 text-xs text-red-500">{errors.recipientType}</p>
            )}
          </div>

          {/* Promo Code Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Promo Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="promoCode"
                className={`w-full p-2 mt-1 text-sm border ${
                  errors.promoCode ? 'border-red-500' : 'border-gray-400'
                } rounded`}
                value={formData.promoCode}
                onChange={handleChange}
              />
              {/* Generate Promo Code Button */}
              <button
                type="button"
                className="px-3 py-2 mt-1 bg-purple-500 text-white rounded hover:bg-purple-400 text-sm"
                onClick={generatePromoCode}
              >
                Generate
              </button>
            </div>
            {errors.promoCode && (
              <p className="mt-1 text-xs text-red-500">{errors.promoCode}</p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-sm text-white rounded hover:bg-purple-400"
            >
              Create Campaign
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCampaignForm;