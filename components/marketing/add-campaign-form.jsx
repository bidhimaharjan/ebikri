import { useState } from 'react';
import { toast } from 'react-toastify';

const AddCampaignForm = ({ isOpen, onClose, onConfirm }) => {
  const [campaignName, setCampaignName] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignName,
        discountPercent,
        promoCode,
        recipientType,
        startDate,
        endDate,
      }),
    });

    if (response.ok) {
      toast.success('Campaign created successfully!');
      onClose();
      onConfirm();
    } else {
      toast.error('Error creating campaign');
    }
  };

  const generatePromoCode = () => {
    const randomCode = `${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setPromoCode(randomCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[450px]">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Create Campaign</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Campaign Name *</label>
            <input
              type="text"
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Discount % *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date *</label>
              <input
                type="date"
                className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium">End Date *</label>
              <input
                type="date"
                className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Recipients *</label>
            <select
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              required
            >
              <option value="all">All Customers</option>
              {/* <option value="selected">Selected Customers</option> */}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Promo Code *</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 p-2 mt-1 text-sm border border-gray-400 rounded"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                required
              />
              <button
                type="button"
                className="px-3 py-2 mt-1 bg-purple-500 text-white rounded hover:bg-purple-400 text-sm"
                onClick={generatePromoCode}
              >
                Generate
              </button>
            </div>
          </div>

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