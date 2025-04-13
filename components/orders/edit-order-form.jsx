import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";
import {
  PlusIcon,
  ShoppingCartIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const EditOrderForm = ({ isOpen, onClose, onConfirm, order }) => {
  const [products, setProducts] = useState([{ productId: "", quantity: 1 }]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customer, setCustomer] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderData, setOrderData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
          setPaymentStatus(data.paymentStatus);
        } catch (error) {
          console.error("Error fetching order details:", error);
        }
      };

      fetchOrderDetails();
    }
  }, [isOpen, order]);

  // handle form submission for "Generate QR Code"
  const handleGenerateQRCode = async (e) => {
    e.preventDefault();
    await handleSubmit("Khalti");
  };

  // handle form submission for "Confirm (Offline)"
  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsConfirmed(false);
    await handleSubmit("Other");
  };

  // handle form submission
  const handleSubmit = async (paymentMethod) => {
    try {    
      // ensure that quantity is always set (default to 1 if not provided
      const updatedProducts = products.map((product) => ({
        ...product,
        quantity: product.quantity || 1, // default to 1 if quantity is not set
      }));

      // validate product selection
      if (
        updatedProducts.length === 0 ||
        updatedProducts.some((p) => !p.productId || p.quantity <= 0)
      ) {
        toast.error("Please select a valid product and quantity.");
        return;
      }

      // validate required fields
      if (!deliveryLocation.trim()) {
        toast.error("Please enter a delivery location.");
        return;
      }

      // prepare the request body
      const requestBody = {
        products: products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity || 1,
        })),
        name,
        email,
        phoneNumber,
        deliveryLocation,
        paymentMethod,
        promoCode,
        customer,
      };

      // proceed with order creation
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      // handle response errors
      if (!response.ok) {
        if (data.error) {
          // for insufficient stock errors
          if (data.availableStock !== undefined) {
            toast.error(
              `Only ${data.availableStock} items available for product ID ${data.productId || 'unknown'}`
            );
            return;
          }

          // for invalid promo code errors
          if (data.promoCode) {
            toast.error(`${data.promoCode} is an invalid promo code`);
            return;
          }

          // for other errors
          toast.error(data.error || "Failed to update order");
          return;
        }
      }

      setOrderData(data);
      setTotalAmount(data.totalAmount);
      setDiscountAmount(data.discountAmount || 0);
      setDiscountPercent(data.discountPercent || 0);

      if (paymentMethod === "Khalti" && data.khaltiFailed) {
        // Khalti failed but order was created
        toast.warning(
          "Khalti payment initiation failed, proceeding with offline payment"
        );
        
        // show order details without QR code
        setQrCodeUrl(null);
        setIsConfirmed(true); // show as confirmed offline order
        
        // update local state to reflect offline payment
        setPaymentStatus("pending");
      }
      else if (paymentMethod === "Khalti") {
        // Khalti success case
        const paymentUrl = data?.payment_url;

        if (!paymentUrl) {
          toast.error("Khalti payment URL not found");
          return;
        }
        
        setQrCodeUrl(paymentUrl); // set the QR code URL
        toast.success("Order updated successfully! Scan the QR code to pay.");
      } else {
        // Offline payment
        setIsConfirmed(true);
        toast.success(
          "Order updated successfully! Please change the payment status after payment is completed."
        );
      }
      onConfirm();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(error.message || "Failed to update order");
    }
  };

  // handle payment status refresh button click
  const handleRefreshPayment = async () => {
    setIsRefreshing(true);
    try {
      if (!order?.id) {
        throw new Error("Order information not available");
      }
  
      // fetch the latest order details which includes payment status
      const response = await fetch(`/api/orders/${order.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order status");
      }
  
      const orderData = await response.json();    
      // update the payment status in state
      setPaymentStatus(orderData.paymentStatus);
      
      if (orderData.paymentStatus === "paid") {
        toast.success("Payment completed!");
        // close the form since payment is complete
        onClose();
      } else {
        toast.info(`Current payment status: ${orderData.paymentStatus}`);
      }
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error(error.message || "Error refreshing payment status");
    } finally {
      setIsRefreshing(false);
    }
  };

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

  if (!isOpen) return null;

  // render the form if payment status is not "completed"
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white p-8 rounded-lg shadow-lg transition-all duration-300 ${
          qrCodeUrl ? "w-[900px]" : "w-[700px]"
        } flex flex-col md:flex-row max-h-[90vh] overflow-hidden`}
      >
        {/* Left Section - Form */}
        <div className={`w-full ${qrCodeUrl ? "pr-6" : ""} overflow-y-auto`}>
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
                  <span className="font-semibold">Phone Number:</span>{" "}
                  {phoneNumber}
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
                    value={deliveryLocation || ""}
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
                    value={promoCode || ""}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-center mt-6 gap-4">
                {/* Generate QR Code Button */}
                {/* Show total amount if  Confirm is clicked, otherwise show QR button */}
                {isConfirmed ? (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-md">
                      <p className="text-md font-semibold text-gray-800">
                        Total: Rs. {totalAmount}
                      </p>
                      {discountAmount > 0 && (
                        <>
                          <div className="h-6 w-px bg-gray-300"></div>
                          <p className="text-sm text-gray-800">
                            Discount: Rs. {discountAmount} ({discountPercent}%)
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    !qrCodeUrl && (
                      <button
                        type="button"
                        onClick={handleGenerateQRCode}
                        className="px-4 py-2 bg-green-500 text-sm text-white rounded-md hover:bg-green-600"
                      >
                        Generate QR Code
                      </button>
                    )
                  )}

                {/* Offline Button - Hidden when QR is shown or Confirm is clicked */}
                {!qrCodeUrl && !isConfirmed && (
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-500 text-sm text-white rounded-md hover:bg-purple-400"
                    >
                      Confirm (Offline)
                    </button>
                  )}

                {/* Done Button */}
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-300"
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Payment Notice */}
            {/* Show payment notice for Khalti payment */}
            {qrCodeUrl && !orderData?.khaltiFailed && (
              <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 text-sm">
                <p className="font-semibold">Payment Notice:</p>
                <p>Khalti payment initiated. Please scan the QR code or follow the link to complete the payment.</p>
              </div>
            )}

            {/* Show payment notice for offline payment */}
            {isConfirmed && !orderData?.khaltiFailed && (
              <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 text-sm">
                <p className="font-semibold">Payment Notice:</p>
                <p>Offline payment initiated. Please change the payment status after payment is completed.</p>
              </div>
            )}

            {/* Show payment notice for Khalti failure */}
            {orderData?.khaltiFailed && (
              <div className="mt-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
                <p className="font-semibold">Payment Notice:</p>
                <p>Khalti payment initiation failed. Please proceed with offline payment.</p>
              </div>
            )} 
          </form>
        </div>

        {/* Right Section - QR Code */}
        {qrCodeUrl && (
          <div className="border-l border-gray-300 pl-6 flex flex-col items-center">
            <div className="p-4 w-full">
              <h3 className="text-center font-semibold mb-2">
                Payment QR Code
              </h3>

              {/* Payment Status Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleRefreshPayment}
                  disabled={isRefreshing}
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    isRefreshing ? 'text-gray-500' : 'text-blue-500 hover:text-blue-700'
                  }`}
                >
                  {isRefreshing ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4" />
                  )}
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Generated Dynamic QR Code */}
              <div className="p-4 w-full">
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </div>

              {/* Total Amount and Discount Information */}
              {totalAmount && (
                <div className="mt-3 text-center">
                  {/* Show discount information if discount is applied */}
                  <p className="text-lg font-semibold text-gray-800">
                    Total: Rs. {totalAmount}
                  </p>
                  {discountAmount > 0 && (
                    <>
                      <div className="border-t border-gray-300 my-2"></div>
                      <p className="text-sm font-semibold text-gray-800">
                        Discount: Rs. {discountAmount} ({discountPercent}%)
                      </p>
                    </>
                  )}
                </div>
              )}
              <p className="mt-4 text-sm text-gray-800 text-center">
                Scan this QR code to complete the payment.
              </p>

              {/* Payment Link */}
              <p className="mt-10 text-sm text-gray-800 text-center">
                You can also follow this link for payment:
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EditOrderForm;