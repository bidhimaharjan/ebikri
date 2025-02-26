import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const AddOrderForm = ({ isOpen, onClose, onConfirm }) => {
  const [products, setProducts] = useState([{ productId: "", quantity: "" }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Fetch products and customers when the form is opened
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          // Fetch products
          const productsResponse = await fetch("/api/inventory");
          if (!productsResponse.ok) {
            throw new Error("Failed to fetch products");
          }
          const productsData = await productsResponse.json();
          setAvailableProducts(productsData);

          // Fetch customers
          const customersResponse = await fetch("/api/customers");
          if (!customersResponse.ok) {
            throw new Error("Failed to fetch customers");
          }
          const customersData = await customersResponse.json();
          setCustomers(customersData);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [isOpen]);

  // Handle customer selection
  const handleCustomerChange = (e) => {
    const selectedCustomerId = e.target.value;
    setCustomer(selectedCustomerId);

    if (selectedCustomerId) {
      // Find the selected customer from the customers list
      const selectedCustomer = customers.find(
        (cust) => cust.id === parseInt(selectedCustomerId)
      );

      if (selectedCustomer) {
        // Populate the form fields with the selected customer's details
        setName(selectedCustomer.name);
        setEmail(selectedCustomer.email);
        setPhoneNumber(selectedCustomer.phoneNumber);
      }
    } else {
      // Clear the form fields if no customer is selected
      setName("");
      setEmail("");
      setPhoneNumber("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products,
        customer,
        name,
        email,
        phoneNumber,
        deliveryLocation,
      }),
    });

    if (response.ok) {
      toast.success("Order created successfully!");
      onClose();
      onConfirm();
    } else {
      toast.error("Error creating order");
      onConfirm();
    }
  };

  const addProductField = () => {
    setProducts([...products, { productId: "", quantity: "" }]);
  };

  const removeProductField = (index) => {
    if (index === 0) return; // Prevent removing the first product field
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const updateProductField = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[600px]">
        <h2 className="text-lg font-semibold mb-4">New Order</h2>
        <form onSubmit={handleSubmit}>
          {/* Order Details */}
          <h3 className="text-md font-semibold mb-2">Order Details</h3>
          {products.map((product, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center relative">
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  Product ID *
                </label>
                <select
                  className="w-full p-2 mt-1 border-gray-300 border rounded bg-gray-200"
                  value={product.productId}
                  onChange={(e) =>
                    updateProductField(index, "productId", e.target.value)
                  }
                  required
                >
                  <option value="">Select a product</option>
                  {availableProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      ID{prod.id} {prod.productName} (Stock:{" "}
                      {prod.stockAvailability}, Price: {prod.unitPrice})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2 relative">
                <label className="block text-sm font-medium">Quantity *</label>
                <input
                  type="number"
                  className="w-full p-2 mt-1 border-gray-300 rounded bg-gray-200 pr-8"
                  value={product.quantity}
                  onChange={(e) =>
                    updateProductField(index, "quantity", e.target.value)
                  }
                  required
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeProductField(index)}
                    className="absolute right-2 top-3 transform -translate-y-1/2 text-red-500 font-semibold hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-center my-2">
            <button
              type="button"
              onClick={addProductField}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Add Another Product
            </button>
          </div>

          {/* Customer Details */}
          <h3 className="text-md font-semibold mt-4 mb-2">Customer Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Choose a Customer
              </label>
              <select
                className="w-full p-2 mt-1 border-gray-300 border rounded bg-gray-200"
                value={customer}
                onChange={handleCustomerChange} // Updated handler
              >
                <option value="">Select a customer</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    ID{cust.id} {cust.name} ({cust.phoneNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">
                Delivery Location *
              </label>
              <input
                type="text"
                className="w-full p-2 mt-1 border-gray-300 rounded bg-gray-200"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="text-center my-2 font-semibold">OR</p>

          {/* Toggle Button for Manual Customer Entry */}
          <div className="flex justify-center my-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            >
              Enter Customer Details
            </button>
          </div>

          {/* Manual Customer Entry */}
          {showCustomerDetails && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mt-4 text-sm font-medium">Name *</label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 border-gray-300 rounded bg-gray-200"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mt-4 text-sm font-medium">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className="w-full p-2 mt-1 border-gray-300 rounded bg-gray-200"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full p-2 mt-1 border-gray-300 rounded bg-gray-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Generate QR Code
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

export default AddOrderForm;