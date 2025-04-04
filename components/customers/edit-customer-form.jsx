import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const EditCustomerForm = ({ isOpen, onClose, onConfirm, customer }) => {
  const [name, setName] = useState(customer?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(customer?.phoneNumber || '');
  const [email, setEmail] = useState(customer?.email || '');

  // update form fields when the customer prop changes
  useEffect(() => {
    if (customer) {
        setName(customer.name);
        setPhoneNumber(customer.phoneNumber);
        setEmail(customer.email);
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("Submitting form data:", {
      name,
      phoneNumber,
      email,
    });
  
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phoneNumber,
          email,
        }),
      });
  
      if (response.ok) {
        toast.success('Customer updated successfully!');
        onClose();
        onConfirm();
      } else {
        const errorData = await response.json();
        console.error("Error updating customer:", errorData);
        toast.error('Error updating customer');
        onConfirm();
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error updating customer');
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium">Name *</label>
            <input
              type="text"
              className="w-full p-2 mt-1 text-sm border-gray-300 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 text-sm border-gray-300 rounded"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Email *</label>
            <input
              type="email"
              className="w-full p-2 mt-1 text-sm border-gray-300 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-400"
            >
              Update Customer
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-400"
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

export default EditCustomerForm;