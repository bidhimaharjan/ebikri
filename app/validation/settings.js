// validate personal info
export const validatePersonalInfo = (personalInfo) => {
  const errors = {};

  // Name validation
  if (!personalInfo.name || !personalInfo.name.trim()) {
    errors.name = "Name is required";
  } else {
    if (personalInfo.name !== personalInfo.name.trim()) {
      errors.name = "Name cannot start or end with spaces";
    } else {
      const parts = personalInfo.name.trim().replace(/\s+/g, " ").split(" ");

      if (parts.length < 2) {
        errors.name = "Please enter at least first and last name";
      } else if (parts.some((part) => part.length < 2)) {
        errors.name = "Each name part must be at least 2 characters";
      } else if (personalInfo.name.length > 50) {
        errors.name = "Name cannot exceed 50 characters";
      } else if (parts.some((part) => part[0] !== part[0].toUpperCase())) {
        errors.name = "Each name part must start with an uppercase letter";
      } else if (personalInfo.name !== personalInfo.name.trim().replace(/\s+/g, " ")) {
        errors.name = "Only one space is allowed between name parts";
      }
    }
  }

  // Email validation (if being changed)
  if (!personalInfo.email || !personalInfo.email.trim()) {
    errors.email = "Email is required";
  } else {
    if (
      !/^(?!.*\.\.)(?!.*\._)(?!.*_\.)(?!^[_.])(?!.*[_.]$)[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
        personalInfo.email
      )
    ) {
      errors.email = "Invalid email format";
    } else if (personalInfo.email.length > 255) {
      errors.email = "Email cannot exceed 255 characters";
    }
  }

  // Phone validation (if being changed)
  if (!personalInfo.phoneNumber || !personalInfo.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else {
    if (!/^\d{10}$/.test(personalInfo.phoneNumber)) {
      errors.phoneNumber = "Phone number must be exactly 10 digits";
    } else if (!/^(98|97|96)/.test(personalInfo.phoneNumber)) {
      errors.phoneNumber = "Phone number must start with 98, 97, or 96";
    }
  }

  return errors;
};

// validate business info
export const validateBusinessInfo = (businessInfo) => {
  const errors = {};

  // Business name validation (if provided)
  if (!businessInfo.businessName || !businessInfo.businessName.trim()) {
    errors.businessName = "Business name is required";
  } else {
    if (businessInfo.businessName.length > 100) {
      errors.businessName = "Business name cannot exceed 100 characters";
    } else if (/[^a-zA-Z0-9\s&.,'-]/.test(businessInfo.businessName)) {
      errors.businessName =
        "Business name can only contain letters, numbers, spaces, and the following characters: &,.,'-";
    } else if (businessInfo.businessName.trim() !== businessInfo.businessName) {
      errors.businessName = "Business name cannot start or end with spaces";
    } else if (/\s{2,}/.test(businessInfo.businessName)) {
      errors.businessName = "Only one space is allowed between words";
    }
  }

  // Business email validation (if provided)
  if (!businessInfo.businessEmail && !businessInfo.businessEmail.trim()) {
    if (
      !/^(?!.*\.\.)(?!.*\._)(?!.*_\.)(?!^[_.])(?!.*[_.]$)[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
        businessInfo.businessEmail
      )
    ) {
      errors.businessEmail = "Invalid business email format";
    } else if (businessInfo.businessEmail.trim().length > 255) {
      errors.businessEmail = "Business email cannot exceed 255 characters";
    }
  }

  // PAN validation (if provided)
  if (businessInfo.panNumber && businessInfo.panNumber.trim()) {
    if (!/^\d{9}$/.test(businessInfo.panNumber)) {
      errors.panNumber = "Must be exactly 9 digits";
    }
  }

  return errors;
};

// validate password change
export const validatePasswordChange = (passwordInfo) => {
  const errors = {};

  // Current password required when changing password
  if (!passwordInfo.currentPassword || !passwordInfo.currentPassword.trim()) {
    errors.currentPassword = "Current password is required";
  }

  // New password validation
  if (!passwordInfo.newPassword || !passwordInfo.newPassword.trim()) {
    errors.newPassword = "New password is required";
  } else {
    if (passwordInfo.newPassword !== passwordInfo.newPassword.trim()) {
      errors.password = "Password cannot start or end with spaces";
    } else {
      if (passwordInfo.newPassword.length < 8) {
        errors.newPassword = "Must be at least 8 characters";
      }
      if (passwordInfo.newPassword.length > 100) {
        errors.password = "Password is too long";
      }
      if (!/[A-Z]/.test(passwordInfo.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}. Must contain uppercase letter`
          : "Must contain at least one uppercase letter";
      }
      if (!/[a-z]/.test(passwordInfo.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}. Must contain lowercase letter`
          : "Must contain at least one lowercase letter";
      }
      if (!/[0-9]/.test(passwordInfo.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}. Must contain number`
          : "Must contain at least one number";
      }
      if (!/[^A-Za-z0-9]/.test(passwordInfo.newPassword)) {
        errors.newPassword = errors.newPassword
          ? `${errors.newPassword}. Must contain special character`
          : "Must contain at least one special character";
      }
    }
  }

  // Confirm password
  if (!passwordInfo.confirmPassword || !passwordInfo.confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your password";
  } else if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
    errors.confirmPassword = "Passwords don't match";
  }

  return errors;
};

// password strength validation
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
  