/**
 * Input sanitization utilities to prevent XSS attacks
 * Use these functions to clean user-generated content before display
 */

/**
 * Basic HTML sanitization - strips all HTML tags
 * Use for: usernames, titles, short text fields
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Sanitize URLs to prevent javascript: and data: URIs
 * Use for: external links, user-provided URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return "";
  
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return "";
  }
  
  // Ensure URL starts with safe protocol
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
    return `https://${url}`;
  }
  
  return url.trim();
}

/**
 * Sanitize markdown-like text (preserve line breaks, remove dangerous HTML)
 * Use for: recipe descriptions, comments, reviews, bio
 */
export function sanitizeMarkdown(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframes
    .replace(/<object[^>]*>.*?<\/object>/gi, "") // Remove objects
    .replace(/<embed[^>]*>/gi, "") // Remove embeds
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .trim();
}

/**
 * Sanitize recipe ingredients/steps (preserve structure, remove dangerous content)
 * Use for: recipe ingredients, recipe steps
 */
export function sanitizeRecipeContent(input: string[]): string[] {
  if (!input || !Array.isArray(input)) return [];
  
  return input
    .filter((item) => item && typeof item === "string")
    .map((item) => sanitizeMarkdown(item))
    .filter(Boolean);
}

/**
 * Sanitize email (basic validation and lowercase)
 * Use for: email inputs
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>]/g, ""); // Remove angle brackets
}

/**
 * Sanitize username (alphanumeric, underscore, hyphen only)
 * Use for: display names, usernames
 */
export function sanitizeUsername(username: string): string {
  if (!username) return "";
  
  return username
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "") // Only allow safe characters
    .substring(0, 30); // Max 30 characters
}

/**
 * Sanitize search query (prevent SQL injection attempts in text search)
 * Use for: search inputs
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return "";
  
  return query
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/['"`;]/g, "") // Remove quotes and semicolons
    .substring(0, 100); // Max 100 characters
}

/**
 * Sanitize number input (ensure it's actually a number)
 * Use for: ratings, servings, times, nutritional values
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  const num = typeof input === "string" ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return min;
  }
  
  if (max !== undefined && num > max) {
    return max;
  }
  
  return num;
}

/**
 * Sanitize rich text content (allow safe HTML only)
 * Use for: longer text fields where some formatting is desired
 * 
 * Allows: <p>, <br>, <strong>, <em>, <ul>, <ol>, <li>
 * Removes: Everything else including scripts, iframes, event handlers
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";
  
  // First remove all dangerous content
  let cleaned = input
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/on\w+\s*=/gi, "");
  
  // Allow only safe tags
  const allowedTags = ["p", "br", "strong", "em", "b", "i", "ul", "ol", "li", "a"];
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  cleaned = cleaned.replace(tagPattern, (match, tag) => {
    if (allowedTags.includes(tag.toLowerCase())) {
      // For links, sanitize href attribute
      if (tag.toLowerCase() === "a") {
        return match.replace(/href\s*=\s*["']([^"']*)["']/gi, (_, url) => {
          const safeUrl = sanitizeUrl(url);
          return safeUrl ? `href="${safeUrl}"` : "";
        });
      }
      return match;
    }
    return ""; // Remove disallowed tags
  });
  
  return cleaned.trim();
}

/**
 * Escape HTML for safe display (convert to entities)
 * Use when you want to display user input as plain text
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  
  const entityMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
  };
  
  return String(input).replace(/[&<>"'\/]/g, (char) => entityMap[char]);
}

/**
 * Sanitize file name (for uploaded files)
 * Use for: image uploads, file names
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return "";
  
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .substring(0, 255); // Max file name length
}
