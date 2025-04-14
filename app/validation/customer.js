export const validateCustomerForm = (formData) => {
  const errors = {};
  const { name, phoneNumber, email } = formData;

  // Name validation
  if (!name?.trim()) {
    errors.name = "Customer name is required";
  } else {
    // check for starting or ending spaces separately
    if (name !== name.trim()) {
      errors.name = "Name cannot start or end with spaces";
    } else {
      // replace multiple spaces with a single space before splitting
      const parts = name.trim().replace(/\s+/g, " ").split(" ");

      if (parts.length < 2) {
        errors.name = "Please enter at least first and last name";
      } else if (parts.some((part) => part.length < 2)) {
        errors.name = "Each name part must be at least 2 characters";
      } else if (name.length > 50) {
        errors.name = "Name cannot exceed 50 characters";
      } else if (parts.some((part) => part[0] !== part[0].toUpperCase())) {
        errors.name = "Each name part must start with an uppercase letter";
      } else if (name !== name.trim().replace(/\s+/g, " ")) {
        errors.name = "Only one space is allowed between name parts";
      }
    }
  }

  // Phone number validation
  if (!phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (phoneNumber !== phoneNumber.trim()) {
    errors.phoneNumber = "Phone number cannot start or end with spaces";
  } else if (!/^\d{10}$/.test(phoneNumber)) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  } else if (!/^(98|97|96)/.test(phoneNumber)) {
    errors.phoneNumber = "Phone number must start with 98, 97, or 96";
  }

  // Email validation
  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^(?!.*\.\.)(?!.*\._)(?!.*_\.)(?!^[_.])(?!.*[_.]$)[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)
  ) {
    errors.email = "Invalid email format";
  } else if (email.length > 255) {
    errors.email = "Email cannot exceed 255 characters";
  }

  return errors;
};

export const validateCustomerEdit = (formData, originalCustomer) => {
  const errors = validateCustomerForm(formData); // first validate the form data

  // additional checks for edit functionality
  const hasChanges =
    formData.name !== originalCustomer.name ||
    formData.phoneNumber !== originalCustomer.phoneNumber ||
    formData.email !== originalCustomer.email;

  if (!hasChanges) {
    errors.noChanges = "No changes were made to the customer";
  }

  return errors;
};