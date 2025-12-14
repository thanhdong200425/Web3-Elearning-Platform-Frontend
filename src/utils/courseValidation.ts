import { FieldErrors } from "react-hook-form";
import { CourseFormData } from "../schemas/courseForm";

export interface ValidationResult {
  isValid: boolean;
  step?: number;
  title?: string;
  message?: string;
}

/**
 * Validates Step 1: Basic Information
 */
export const validateStep1 = (
  formData: CourseFormData,
  formErrors: FieldErrors<CourseFormData>
): ValidationResult => {
  // Check cover image
  if (!formData.coverImage) {
    return {
      isValid: false,
      step: 1,
      title: "Cover Image Required",
      message: "Please upload a cover image before deploying your course.",
    };
  }

  // Check title
  if (formErrors.title) {
    return {
      isValid: false,
      step: 1,
      title: "Course Title Required",
      message: formErrors.title.message || "Please provide a course title.",
    };
  }

  // Check short description
  if (formErrors.shortDescription) {
    return {
      isValid: false,
      step: 1,
      title: "Short Description Required",
      message:
        formErrors.shortDescription.message ||
        "Please provide a short description.",
    };
  }

  // Check category
  if (formErrors.category) {
    return {
      isValid: false,
      step: 1,
      title: "Category Required",
      message: formErrors.category.message || "Please select a category.",
    };
  }

  return { isValid: true };
};

/**
 * Validates Step 2: Web3 & Pricing Configuration
 */
export const validateStep2 = (
  formData: CourseFormData,
  formErrors: FieldErrors<CourseFormData>,
  isConnected: boolean
): ValidationResult => {
  // Check wallet connection
  if (!isConnected) {
    return {
      isValid: false,
      step: 2,
      title: "Wallet Not Connected",
      message: "Please connect your wallet before deploying.",
    };
  }

  // Check course price
  if (formErrors.coursePrice) {
    return {
      isValid: false,
      step: 2,
      title: "Course Price Required",
      message:
        formErrors.coursePrice.message || "Please set a valid course price.",
    };
  }

  // Check wallet address
  if (formErrors.walletAddress) {
    return {
      isValid: false,
      step: 2,
      title: "Wallet Address Required",
      message:
        formErrors.walletAddress.message || "Please connect your wallet.",
    };
  }

  // Check payment token
  if (formErrors.paymentToken) {
    return {
      isValid: false,
      step: 2,
      title: "Payment Token Required",
      message:
        formErrors.paymentToken.message || "Please select a payment token.",
    };
  }

  return { isValid: true };
};

/**
 * Validates Step 3: Course Content
 */
export const validateStep3 = (
  formData: CourseFormData,
  formErrors: FieldErrors<CourseFormData>
): ValidationResult => {
  // Check if sections exist and have content
  if (
    formErrors.sections ||
    !formData.sections ||
    formData.sections.length === 0
  ) {
    return {
      isValid: false,
      step: 3,
      title: "Course Content Required",
      message: "Please add at least one section with lessons to your course.",
    };
  }

  return { isValid: true };
};

/**
 * Validates all course form steps before deployment
 */
export const validateCourseForDeployment = (
  formData: CourseFormData,
  formErrors: FieldErrors<CourseFormData>,
  isConnected: boolean
): ValidationResult => {
  // Validate Step 1
  const step1Result = validateStep1(formData, formErrors);
  if (!step1Result.isValid) {
    return step1Result;
  }

  // Validate Step 2
  const step2Result = validateStep2(formData, formErrors, isConnected);
  if (!step2Result.isValid) {
    return step2Result;
  }

  // Validate Step 3
  const step3Result = validateStep3(formData, formErrors);
  if (!step3Result.isValid) {
    return step3Result;
  }

  return { isValid: true };
};
