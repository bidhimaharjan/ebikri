export const validateProductForm = (formData) => {
  const errors = {};

  // Product Name validation
  if (!formData.productName?.trim()) {
    errors.productName = "Product name is required";
  } else {
    if (formData.productName.length < 2) {
      errors.productName = "Product name must be at least 2 characters";
    } else if (formData.productName.length > 255) {
      errors.productName = "Product name cannot exceed 255 characters";
    } else if (/[^a-zA-Z0-9\s&.,'-]/.test(formData.productName)) {
      errors.productName =
        "Contains invalid characters. Only letters, numbers, spaces, and &.,'- allowed";
    } else if (formData.productName.trim() !== formData.productName) {
      errors.productName = "Cannot start or end with spaces";
    } else if (/\s{2,}/.test(formData.productName)) {
      errors.productName = "Cannot contain multiple consecutive spaces";
    }
  }

  // Stock validation
  if (!formData.stockAvailability && formData.stockAvailability !== 0) {
    errors.stockAvailability = "Stock quantity is required";
  } else {
    const stock = Number(formData.stockAvailability);
    if (isNaN(stock)) {
      errors.stockAvailability = "Must be a valid number";
    } else if (!Number.isInteger(stock)) {
      errors.stockAvailability = "Must be a whole number";
    } else if (stock < 0) {
      errors.stockAvailability = "Cannot be negative";
    } else if (stock == 0) {
      errors.stockAvailability = "Cannot be zero";
    } else if (stock > 100000) {
      errors.stockAvailability = "Cannot exceed 1,00,000";
    }
  }

  // Price validation
  if (!formData.unitPrice && formData.unitPrice !== 0) {
    errors.unitPrice = "Price is required";
  } else {
    const price = Number(formData.unitPrice);
    if (isNaN(price)) {
      errors.unitPrice = "Must be a valid number";
    } else if (price < 0) {
      errors.unitPrice = "Cannot be negative";
    } else if (price == 0) {
      errors.unitPrice = "Cannot be zero";
    } else if (price > 1000000) {
      errors.unitPrice = "Cannot exceed 10,00,000";
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.unitPrice.toString())) {
      errors.unitPrice = "Can have maximum 2 decimal places";
    }
  }

  return errors;
};

export const validateProductEdit = (formData, originalProduct) => {
  const errors = validateProductForm(formData); // first validate the form data
  
  // additional checks for edit functionality
  const hasChanges = 
    formData.productName !== originalProduct.productName ||
    Number(formData.stockAvailability) !== Number(originalProduct.stockAvailability) ||
    parseFloat(formData.unitPrice) !== parseFloat(originalProduct.unitPrice);

  if (!hasChanges) {
    errors.noChanges = 'No changes were made to the product';
  }

  return errors;
};