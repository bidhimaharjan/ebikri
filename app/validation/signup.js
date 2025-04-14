export const validateSignupForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = "Name is required";
  } else {
    // check for starting or ending spaces separately
    if (formData.name !== formData.name.trim()) {
      errors.name = "Name cannot start or end with spaces";
    } else {
      // replace multiple spaces with a single space before splitting
      const parts = formData.name.trim().replace(/\s+/g, " ").split(" ");

      if (parts.length < 2) {
        errors.name = "Please enter at least first and last name";
      } else if (parts.some((part) => part.length < 2)) {
        errors.name = "Each name part must be at least 2 characters";
      } else if (formData.name.length > 50) {
        errors.name = "Name cannot exceed 50 characters";
      } else if (parts.some((part) => part[0] !== part[0].toUpperCase())) {
        errors.name = "Each name part must start with an uppercase letter";
      } else if (formData.name !== formData.name.trim().replace(/\s+/g, " ")) {
        errors.name = "Only one space is allowed between name parts";
      }
    }
  }

  // Phone number validation
  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (formData.phoneNumber !== formData.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number cannot start or end with spaces";
  } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Phone number must be exactly 10 digits";
  } else if (!/^(98|97|96)/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Phone number must start with 98, 97, or 96";
  }

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^(?!.*\.\.)(?!.*\._)(?!.*_\.)(?!^[_.])(?!.*[_.]$)[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
      formData.email
    )
  ) {
    errors.email = "Invalid email format";
  } else if (formData.email.length > 255) {
    errors.email = "Email cannot exceed 255 characters";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else {
    // check for starting or ending spaces separately
    if (formData.password !== formData.password.trim()) {
      errors.password = "Password cannot start or end with spaces";
    } else {
      if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      }
      if (formData.password.length > 100) {
        errors.password = "Password is too long";
      }
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}. Must contain uppercase letter`
          : "Must contain at least one uppercase letter";
      }
      if (!/[a-z]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}. Must contain lowercase letter`
          : "Must contain at least one lowercase letter";
      }
      if (!/[0-9]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}. Must contain number`
          : "Must contain at least one number";
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        errors.password = errors.password
          ? `${errors.password}. Must contain special character`
          : "Must contain at least one special character";
      }
    }
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Business name validation
  if (!formData.businessName?.trim()) {
    errors.businessName = "Business name is required";
  } else if (formData.businessName.length > 100) {
    errors.businessName = "Business name cannot exceed 100 characters";
  } else if (/[^a-zA-Z0-9\s&.,'-]/.test(formData.businessName)) {
    errors.businessName =
      "Business name can only contain letters, numbers, spaces, and the following characters: &,.,'-";
  } else if (formData.businessName.trim() !== formData.businessName) {
    errors.businessName = "Business name cannot start or end with spaces";
  } else if (/\s{2,}/.test(formData.businessName)) {
    errors.businessName = "Only one space is allowed between words";
  }

  // Business type validation
  if (!formData.businessType?.trim()) {
    errors.businessType = "Business type is required";
  }

  // Business email validation (if provided)
  if (formData.businessEmail && formData.businessEmail.trim()) {
    if (
      !/^(?!.*\.\.)(?!.*\._)(?!.*_\.)(?!^[_.])(?!.*[_.]$)[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
        formData.businessEmail
      )
    ) {
      errors.businessEmail = "Invalid business email format";
    } else if (formData.businessEmail.trim().length > 255) {
      errors.businessEmail = "Business email cannot exceed 255 characters";
    }
  }

  // PAN number validation (if provided)
  if (formData.panNumber?.trim()) {
    if (!/^\d{9}$/.test(formData.panNumber.trim())) {
      errors.panNumber = "PAN number must be exactly 9 digits";
    }
  }

  return errors;
};

// Password strength validation
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  let strength = 0;

  // length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // complexity checks
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  return strength;
};
