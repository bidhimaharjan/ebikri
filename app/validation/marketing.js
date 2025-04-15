export const validateCampaignForm = (formData) => {
  const errors = {};
  const { campaignName, discountPercent, promoCode, startDate, endDate } =
    formData;

  // Campaign Name validation
  if (!campaignName?.trim()) {
    errors.campaignName = "Campaign name is required";
  } else {
    if (campaignName.length < 2) {
      errors.campaignName = "Campaign name must be at least 2 characters";
    } else if (campaignName.length > 255) {
      errors.campaignName = "Campaign name cannot exceed 255 characters";
    } else if (/[^a-zA-Z0-9\s&.,'-]/.test(campaignName)) {
      errors.campaignName =
        "Contains invalid characters. Only letters, numbers, spaces, and &.,'- allowed";
    } else if (campaignName.trim() !== campaignName) {
      errors.campaignName = "Cannot start or end with spaces";
    } else if (/\s{2,}/.test(campaignName)) {
      errors.campaignName = "Cannot contain multiple consecutive spaces";
    }
  }

  // Discount Percent validation
  if (!discountPercent) {
    errors.discountPercent = "Discount percent is required";
  } else if (isNaN(discountPercent)) {
    errors.discountPercent = "Must be a valid number";
  } else if (parseFloat(discountPercent) <= 0) {
    errors.discountPercent = "Discount must be greater than 0";
  } else if (parseFloat(discountPercent) > 100) {
    errors.discountPercent = "Discount cannot exceed 100%";
  }

  // Promo Code validation
  if (!promoCode?.trim()) {
    errors.promoCode = "Promo code is required";
  } else if (promoCode.length !== 6) {
    errors.promoCode = "Promo code must be exactly 6 characters";
  } else if (!/^[A-Z0-9]+$/.test(promoCode)) {
    errors.promoCode =
      "Promo code can only contain uppercase letters and numbers";
  } 

  // Date validation
  if (!startDate) {
    errors.startDate = "Start date is required";
  }

  if (!endDate) {
    errors.endDate = "End date is required";
  } else if (startDate && new Date(endDate) <= new Date(startDate)) {
    errors.endDate = "End date must be after start date";
  }

  return errors;
};

export const validateCampaignEdit = (formData, originalCampaign) => {
  const errors = validateCampaignForm(formData);

  // additional checks for edit functionality
  const hasChanges =
    formData.campaignName !== originalCampaign.campaignName ||
    formData.discountPercent !== originalCampaign.discountPercent ||
    formData.promoCode !== originalCampaign.promoCode ||
    formData.startDate !== originalCampaign.startDate ||
    formData.endDate !== originalCampaign.endDate;

  if (!hasChanges) {
    errors.noChanges = "No changes were made to the campaign";
  }

  return errors;
};
