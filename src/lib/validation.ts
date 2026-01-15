/**
 * Form validation utilities
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  return { isValid: true };
}

/**
 * Password validation
 */
export function validatePassword(password: string, minLength: number = 6): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }
  
  return { isValid: true };
}

/**
 * Password confirmation validation
 */
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  
  return { isValid: true };
}

/**
 * Recipe title validation
 */
export function validateRecipeTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "Recipe title is required" };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: "Title must be at least 3 characters" };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: "Title must be less than 100 characters" };
  }
  
  return { isValid: true };
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
}

/**
 * Number range validation
 */
export function validateNumberRange(
  value: number | string,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (num < min || num > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true };
}

/**
 * File validation
 */
export function validateImageFile(file: File | null): ValidationResult {
  if (!file) {
    return { isValid: true }; // Optional file
  }
  
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: "Please upload a valid image (JPG, PNG, or WebP)" };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: "Image must be less than 5MB" };
  }
  
  return { isValid: true };
}

/**
 * Username validation
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "Username is required" };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }
  
  if (trimmed.length > 30) {
    return { isValid: false, error: "Username must be less than 30 characters" };
  }
  
  // Only allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { isValid: false, error: "Username can only contain letters, numbers, underscores, and hyphens" };
  }
  
  return { isValid: true };
}

/**
 * Rating validation
 */
export function validateRating(rating: number): ValidationResult {
  if (rating < 1 || rating > 5) {
    return { isValid: false, error: "Rating must be between 1 and 5" };
  }
  
  return { isValid: true };
}
