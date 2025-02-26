import { useState } from 'react';
import { toast } from 'react-toastify';
import ToastifyContainer from '@/components/toastifycontainer';

const AddProductForm = ({ isOpen, onClose, onConfirm }) => {
  const [productName, setProductName] = useState('');
  const [stock, setStock] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName,
        stockAvailability: stock,
        unitPrice: price,
      }),
    });

    if (response.ok) {
      toast.success('Product added successfully!');
      onClose();
      window.location.reload();
    } else {
      toast.error('Error adding product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Add Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium">Product Name *</label>
            <input
              type="text"
              className="w-full p-2 mt-1 border-gray-200 border rounded bg-gray-200"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Stock (pcs) *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 border-gray-200 rounded bg-gray-200"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium">Unit Price (NPR) *</label>
            <input
              type="number"
              className="w-full p-2 mt-1 border-gray-200 border rounded bg-gray-200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Add Product
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

      <ToastifyContainer />
    </div>
  );
};

export default AddProductForm;

