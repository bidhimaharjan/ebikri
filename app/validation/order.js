export const validateOrderForm = (formData) => {
    const errors = {};
    const { products, deliveryLocation } = formData;
  
    // Products validation
    // if (!products || !products.length) {
    //   errors.products = "At least one product is required";
    // } else {
    //   products.forEach((product, index) => {
    //     if (!product.productId) {
    //       errors[`products[${index}].productId`] = "Product selection is required";
    //     }
    //     if (!product.quantity || product.quantity <= 0) {
    //       errors[`products[${index}].quantity`] = "Quantity must be at least 1";
    //     }
    //   });
    // }
  
    // Delivery location validation
    if (!deliveryLocation?.trim()) {
      errors.deliveryLocation = "Delivery location is required";
    } else if (deliveryLocation !== deliveryLocation.trim()) {
        errors.deliveryLocation = "Delivery location cannot start or end with spaces";
    } else if (deliveryLocation.length > 255) {
      errors.deliveryLocation = "Delivery location cannot exceed 255 characters";
    }
  
    return errors;
  };
  
  export const validateOrderEdit = (formData, originalOrder) => {
    const errors = validateOrderForm(formData); // first validate the form data  
    // additional checks for edit functionality
    const hasChanges = 
      // check delivery location
      formData.deliveryLocation !== originalOrder.deliveryLocation ||
      // check products
      JSON.stringify(formData.products) !== JSON.stringify(originalOrder.products.map(p => ({
        productId: p.productId,
        quantity: p.quantity
      })));
  
    if (!hasChanges) {
      errors.noChanges = "No changes were made to the order";
    }
  
    return errors;
  };