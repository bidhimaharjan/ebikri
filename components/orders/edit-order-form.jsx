import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import {
  PlusIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const EditOrderForm = ({ isOpen, onClose, onConfirm, order }) => {
  const [products, setProducts] = useState([{ productId: "", quantity: "" }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customer, setCustomer] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [promoCode, setPromoCode] = useState("");
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
          setPromoCode(data.promoCode);
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
      // Validate required fields
      if (!deliveryLocation.trim()) {
        toast.error("Please enter a delivery location.");
        return;
      }
  
      // Prepare the request body
      const requestBody = {
        products: products.map(p => ({
          productId: p.productId,
          quantity: p.quantity || 1
        })),
        name,
        email,
        phoneNumber,
        deliveryLocation,
        paymentMethod,
        promoCode,
        customer: customer // pass the customer ID if exists
      };
  
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }
  
      const data = await response.json();
      
      if (paymentMethod === "Khalti" && data.payment_url) {
        setQrCodeUrl(data.payment_url);
        toast.success("Order updated! Scan QR to pay.");
      } else {
        toast.success("Order updated successfully!");
        onConfirm();
        onClose();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    }
  };
  // const handleSubmit = async (paymentMethod) => {
  //   try {
  //     // check if payment status is pending or failed
  //     if (paymentStatus !== "pending" && paymentStatus !== "failed") {
  //       toast.error(
  //         "Order can only be modified when payment status is pending or failed."
  //       );
  //       return;
  //     }

  //     // ensure that quantity is always set (default to 1 if not provided
  //     const updatedProducts = products.map((product) => ({
  //       ...product,
  //       quantity: product.quantity || 1, // default to 1 if quantity is not set
  //     }));

  //     // validate product selection
  //     if (
  //       products.length === 0 ||
  //       products.some((p) => !p.productId || !p.quantity || p.quantity <= 0)
  //     ) {
  //       toast.error("Please select a valid product and quantity.");
  //       return;
  //     }

  //     // validate delivery location
  //     if (!deliveryLocation.trim()) {
  //       toast.error("Please enter a delivery location.");
  //       return;
  //     }

  //     // proceed with order update
  //     const response = await fetch(`/api/orders/${order.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         products: products,
  //         deliveryLocation: deliveryLocation,
  //         // paymentMethod
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json(); // Parse the JSON response body
  //       toast.success(data.message);
  //     } else {
  //       toast.error("Failed to update order");
  //       throw new Error("Failed to update order");
  //     }

  //     // onClose();
  //     onConfirm();
  //   } catch (error) {
  //     console.error("Error updating order:", error);
  //     toast.error("Failed to update order");
  //     onConfirm();
  //   }
  // };

  const addProductField = () => {
    setProducts([...products, { productId: "", quantity: "" }]);
  };

  const removeProductField = (index) => {
    if (products.length <= 1) return; // prevent removing the last product field
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
      toast.error(
        "This order cannot be modified because payment is already completed."
      );
      onClose();
    }
  }, [isOpen, paymentStatus, onClose]);

  // if payment status is "paid," do not render the form
  if (!isOpen || paymentStatus === "paid") return null;

  // render the form if payment status is not "completed"
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Left Section - Form */}
        <h2 className="text-lg text-gray-800 font-semibold mb-4">
          Modify Order
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Order Details */}
          <div className="border bg-gray-100 rounded-lg p-4 mb-4 text-gray-800">
            <h3 className="text-md font-semibold mb-2 flex items-center">
              <ShoppingCartIcon className="h-4 w-4 mr-1" />
              Order Details
            </h3>

            {products.map((product, index) => (
              <div key={index} className="flex gap-4 mb-4 items-center">
                {/* Product selection */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium">
                    Product ID *
                  </label>
                  <select
                    className="w-full p-2 mt-1 text-sm border border-gray-300 rounded select-truncate"
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

                {/* Quantity Input */}
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Quantity *
                  </label>
                 
                  <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden h-10 flex-1">
                        {/* Decrement Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = Math.max(
                              1,
                              parseInt(product.quantity || 1) - 1
                            );
                            updateProductField(index, "quantity", newQty);
                          }}
                          className="px-3 py-2 text-gray-600 hover:text-black text-lg font-bold bg-gray-100 hover:bg-gray-200"
                        >
                          −
                        </button>

                        {/* Quantity Input Field */}
                        <input
                          type="number"
                          className="w-full text-center p-2 text-sm border-0 focus:ring-0 outline-none"
                          value={product.quantity || 1} // default to 1
                          onChange={(e) => {
                            const newQty = Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            );
                            updateProductField(index, "quantity", newQty);
                          }}
                          min={1}
                          required
                          onFocus={(e) => {
                            // clear the input when focused
                            if (e.target.value !== "") {
                              e.target.value = "";
                            }
                          }}
                          onBlur={(e) => {
                            // reset the input to 1 if left blank
                            if (e.target.value === "") {
                              updateProductField(index, "quantity", 1);
                            }
                          }}
                        />

                        {/* Increment Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newQty = parseInt(product.quantity || 1) + 1;
                            updateProductField(index, "quantity", newQty);
                          }}
                          className="px-3 py-2 text-gray-600 hover:text-black text-lg font-bold bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>

                      {/* Add Button */}
                      <div className="flex items-center gap-1">
                        {index === products.length - 1 && (
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={addProductField}
                              className="p-1 text-blue-500 hover:text-blue-600 rounded-full hover:bg-blue-100 border border-blue-300 flex items-center justify-center w-6 h-6"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Add another
                            </span>
                          </div>
                        )}

                        {/* Remove Button */}
                        <div className="relative group">
                          <button
                            type="button"
                            onClick={() => removeProductField(index)}
                            disabled={products.length <= 1 && index === 0} // disable the button for the first product if there's only one product
                            className={`p-1 rounded-full border flex items-center justify-center w-6 h-6 ${
                              products.length <= 1 && index === 0
                                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                : "text-red-500 hover:text-red-600 hover:bg-red-100 border-red-300"
                            }`}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Remove
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {/* Customer Details (for display only) */}
          <div className="border bg-gray-100 rounded-lg p-4 mb-4 text-gray-800">
            <h3 className="text-md font-semibold mb-2 flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              Customer Details
            </h3>

            <div className="space-y-2 text-sm mb-1">
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
          </div>

          {/* Delivery Location, Promo Code, Submit Buttons */}
          <div className="border bg-gray-100 rounded-lg p-4 text-gray-800">
            {/* Delivery Location Field */}
            <div className="flex gap-4 mb-4 mr-4 items-center">
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  Change Delivery Location *
                </label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 text-sm border border-gray-300 rounded select-truncate"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  required
                />
              </div>

              {/* Promo Code Field */}
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  Promo Code (Optional)
                </label>
                <input
                  type="text"
                  className="w-full p-2 mt-1 text-sm border border-gray-300 rounded select-truncate"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-center mt-6 gap-4">
              <button
                type="button"
                onClick={() => handleSubmit("Khalti")}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
              >
                Generate QR Code
              </button>

              <button
                type="button"
                onClick={() => handleSubmit("Other")}
                className="px-4 py-2 bg-purple-500 text-sm text-white rounded-md hover:bg-purple-400"
              >
                Confirm (Offline)
              </button>

              <button
                type="button"
                className="px-4 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-300"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        </form>

        {/* Right Section - QR Code */}
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
