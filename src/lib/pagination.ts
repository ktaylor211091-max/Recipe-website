/**
 * Pagination Utilities
 * Helpers for implementing efficient pagination across the application
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Calculate the start and end indices for a pagination query
 * @param params Pagination parameters (page and limit)
 * @returns Object with start and end indices for database queries
 */
export function getPaginationRange(params: PaginationParams): { start: number; end: number } {
  const { page, limit } = params;
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  return { start, end };
}

/**
 * Generate pagination metadata for UI components
 * @param total Total number of items
 * @param page Current page number (1-indexed)
 * @param limit Items per page
 * @returns Pagination metadata object
 */
export function getPaginationMetadata(
  total: number,
  page: number,
  limit: number
): PaginationMetadata {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
}

/**
 * Validate pagination parameters
 * @param page Current page number
 * @param limit Items per page
 * @returns Validated and normalized parameters
 */
export function validatePaginationParams(
  page: number | string | undefined,
  limit: number | string | undefined
): PaginationParams {
  const validatedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const validatedLimit = Math.min(
    100,
    Math.max(1, parseInt(String(limit || 20), 10) || 20)
  );

  return {
    page: validatedPage,
    limit: validatedLimit,
  };
}

/**
 * Generate page numbers for pagination UI
 * @param currentPage Current page number
 * @param totalPages Total number of pages
 * @param maxVisible Maximum number of page buttons to show
 * @returns Array of page numbers to display
 */
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 7
): (number | string)[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);
  
  // Always show first page
  pages.push(1);

  let start = Math.max(2, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust range if at beginning or end
  if (currentPage <= halfVisible) {
    end = maxVisible - 1;
  } else if (currentPage >= totalPages - halfVisible) {
    start = totalPages - maxVisible + 2;
  }

  // Add ellipsis after first page if needed
  if (start > 2) {
    pages.push("...");
  }

  // Add page numbers
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (end < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}
