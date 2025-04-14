import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { validateProductForm } from '@/app/validation/product';

const EditProductForm = ({ isOpen, onClose, onConfirm, product }) => {
  const [formData, setFormData] = useState({
    productName: '',
    stockAvailability: '',
    unitPrice: ''
  });
  const [errors, setErrors] = useState({});

  // update form fields when the product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        stockAvailability: product.stockAvailability,
        unitPrice: product.unitPrice
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validate form
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }
  
    try {
      const response = await fetch(`/api/inventory/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: formData.productName.trim(),
          stockAvailability: parseInt(formData.stockAvailability),
          unitPrice: parseFloat(formData.unitPrice)
        }),
      });
  
      if (response.ok) {
        toast.success('Product updated successfully!');
        onClose();
        onConfirm();
        setErrors({});
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg text-gray-800 font-semibold mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit}>
          {/* Product Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Product Name *</label>
            <input
              type="text"
              name="productName"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.productName ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.productName}
              onChange={handleChange}
            />
            {errors.productName && (
              <p className="mt-1 text-xs text-red-500">{errors.productName}</p>
            )}
          </div>

          {/* Stock Availability Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Stock (pcs) *</label>
            <input
              type="number"
              name="stockAvailability"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.stockAvailability ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.stockAvailability}
              onChange={handleChange}
            />
            {errors.stockAvailability && (
              <p className="mt-1 text-xs text-red-500">{errors.stockAvailability}</p>
            )}
          </div>

          {/* Unit Price Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium">Unit Price (NPR) *</label>
            <input
              type="number"
              name="unitPrice"
              className={`w-full p-2 mt-1 text-sm border rounded ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-400'
              }`}
              value={formData.unitPrice}
              onChange={handleChange}
            />
            {errors.unitPrice && (
              <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>
            )}
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white text-sm rounded-md hover:bg-purple-400"
            >
              Update Product
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

export default EditProductForm;