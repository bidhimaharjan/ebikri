import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

const EditOrderForm = ({ isOpen, onClose, onConfirm, order }) => {
  const [products, setProducts] = useState([{ productId: "", quantity: "" }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customer, setCustomer] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  // fetch available products when the form is opened
  useEffect(() => {
    if (isOpen) {
      const fetchAvailableProducts = async () => {
        try {
          const response = await fetch("/api/inventory");
          if (!response.ok) throw new Error("Failed to fetch products");
          const productsData = await response.json();
          setAvailableProducts(productsData.sort((a, b) => a.id - b.id));
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };

      fetchAvailableProducts();
    }
  }, [isOpen]);

  // update form fields when the order prop changes
  useEffect(() => {
    if (isOpen && order?.id) {
      const fetchOrderDetails = async () => {
        try {
          console.log("Fetching order details for ID:", order.id);
          const response = await fetch(`/api/orders/${order.id}`);
          if (!response.ok) throw new Error("Failed to fetch order details");
          
          const data = await response.json();
          // update the state with the fetched order details
          setProducts(data.products);
          setCustomer(data.customer.id);
          setName(data.customer.name);
          setEmail(data.customer.email);
          setPhoneNumber(data.customer.phoneNumber);
          setDeliveryLocation(data.deliveryLocation);
          setTotalAmount(data.totalAmount);
          setPaymentStatus(data.paymentStatus);
        } catch (error) {
          console.error("Error fetching order details:", error);
        }
      };
  
      fetchOrderDetails();
    }
  }, [isOpen, order]);

  // handle form submission
  const handleSubmit = async (paymentMethod) => {
    try {
      // check if payment status is pending or failed
      if (paymentStatus !== "pending" && paymentStatus !== "failed") {
        toast.error("Order can only be modified when payment status is pending or failed.");
        return;
      }

      // validate product selection
      if (products.length === 0 || products.some(p => !p.productId || !p.quantity || p.quantity <= 0)) {
        toast.error("Please select a valid product and quantity.");
        return;
      }

      // validate delivery location
      if (!deliveryLocation.trim()) {
        toast.error("Please enter a delivery location.");
        return;
      }

      // proceed with order update
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products,
          deliveryLocation,
          paymentMethod,
        }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      const updatedOrderData = await response.json();
      setTotalAmount(updatedOrderData.order.totalAmount);

      if (paymentMethod === "Khalti") {
        const paymentUrl = updatedOrderData.payment_url;
        if (!paymentUrl) throw new Error("Khalti payment URL not found");
        setQrCodeUrl(paymentUrl);
        toast.success("Order updated successfully! Scan the QR code to pay.");
      } else {
        toast.success("Order updated successfully! Please change the payment status after payment is completed");
      }

      onClose();
      onConfirm();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      onConfirm();
    }
  };

  const addProductField = () => {
    setProducts([...products, { productId: "", quantity: "" }]);
  };

  const removeProductField = (index) => {
    if (index === 0) return; // prevent removing the first product field
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const updateProductField = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  // if payment status is "paid," show a toast error and close the form
  useEffect(() => {
    if (isOpen && paymentStatus === "paid") {
      toast.error("This order cannot be modified because payment is already completed.");
      onClose();
    }
  }, [isOpen, paymentStatus, onClose]);

  // if payment status is "paid," do not render the form
  if (!isOpen || paymentStatus === "paid") return null;

  // render the form if payment status is not "completed"
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Modify Order</h2>
        <form onSubmit={handleSubmit}>
          {/* Order Details */}
          <h3 className="text-md font-semibold mb-2">Order Details</h3>
          {products.map((product, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <div className="w-1/2">
                <label className="block text-sm font-medium">Product ID *</label>
                <select
                  className="w-full p-2 mt-1 border-gray-200 border rounded bg-gray-200"
                  value={product.productId}
                  onChange={(e) => updateProductField(index, "productId", e.target.value)}
                  required
                >
                  <option value="">Select a product</option>
                  {availableProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      ID{prod.id} {prod.productName} (Stock: {prod.stockAvailability}, Price: {prod.unitPrice})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/2 relative">
                <label className="block text-sm font-medium">Quantity *</label>
                <input
                  type="number"
                  className="w-full p-2 mt-1 border-gray-200 rounded bg-gray-200"
                  value={product.quantity}
                  onChange={(e) => updateProductField(index, "quantity", e.target.value)}
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

          {/* Customer Details (Disabled) */}
          <h3 className="text-md font-semibold mt-4 mb-2">Customer Details</h3>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {name}
            </div>
            <div>
              <span className="font-semibold">Phone Number:</span> {phoneNumber}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {email}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">Change Delivery Location *</label>
            <input
              type="text"
              className="w-full p-2 mt-1 border-gray-200 rounded bg-gray-200"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => handleSubmit("Other")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("Khalti")}
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

        {/* QR Code Section */}
        {qrCodeUrl && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold mb-3">Payment QR Code</h3>
            <QRCodeSVG value={qrCodeUrl} size={200} />
            {totalAmount && (
              <p className="mt-3 text-lg font-semibold text-gray-800">
                Total: Rs. {totalAmount}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-800 text-center">
              Scan this QR code to complete the payment.
            </p>
            <a
              href={qrCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-400 hover:text-blue-500 underline break-all"
            >
              {qrCodeUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditOrderForm;