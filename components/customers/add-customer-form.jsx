import { useState } from 'react';
import { toast } from 'react-toastify';

const AddCustomerForm = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phoneNumber,
        email,
      }),
    });

    if (response.ok) {
      toast.success('Customer added successfully!');
      onClose();
      onConfirm();
    } else {
      toast.error('Error adding customer');
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Add Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium">Name *</label>
            <input
              type="text"
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Email *</label>
            <input
              type="email"
              className="w-full p-2 mt-1 text-sm border border-gray-400 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-sm text-white rounded-md hover:bg-purple-400"
            >
              Add Customer
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

export default AddCustomerForm;

