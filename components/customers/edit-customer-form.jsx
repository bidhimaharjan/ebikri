import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { validateCustomerForm, validateCustomerEdit } from '@/app/validation/customer';

const EditCustomerForm = ({ isOpen, onClose, onConfirm, customer }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  // update form fields when the customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phoneNumber: customer.phoneNumber,
        email: customer.email
      });
      setErrors({});
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // validate form
    const validationErrors = validateCustomerEdit(formData, customer);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.noChanges) {
        toast.info(validationErrors.noChanges);
      } else {
        toast.error('Please fix the form errors');
      }
      return;
    }
  
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber,
          email: formData.email.trim(),
        }),
      });
  
      if (response.ok) {
        toast.success('Customer updated successfully!');
        onClose();
        onConfirm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error updating customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Error updating customer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Edit Customer</h2>
        <form onSubmit={handleSubmit}>
          {/* Customer Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Name *</label>
            <input
              type="text"
              name="name"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.name ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.phoneNumber}
              onChange={handleChange}
              maxLength="10"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.email ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-sm text-white rounded-md hover:bg-purple-400"
            >
              Update Customer
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

export default EditCustomerForm;