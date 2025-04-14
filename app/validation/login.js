export const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  }

  return errors;
};
