/**
 * Image Optimization Utilities
 * Provides helpers for efficient image loading and display
 */

/**
 * Generate a placeholder SVG for images that haven't loaded yet
 */
export function getImagePlaceholder(imageUrl: string | null): string {
  if (!imageUrl) {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  }
  return imageUrl;
}

/**
 * Responsive image sizes for different layouts
 */
export const recipeImageSizes = {
  small: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  medium: "(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 50vw",
  large: "100vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw",
};

/**
 * Image quality settings based on environment
 */
export const imageQuality = {
  production: 75,
  development: 85,
  thumbnail: 60,
  hero: 90,
};

/**
 * Get the appropriate image quality based on environment and usage
 */
export function getImageQuality(isHero: boolean = false): number {
  const isProd = process.env.NODE_ENV === "production";
  
  if (isHero) {
    return imageQuality.hero;
  }
  
  return isProd ? imageQuality.production : imageQuality.development;
}

/**
 * Generate blur data URL for image placeholder
 */
export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="0%" />
          <stop stop-color="#e5e7eb" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(canvas).toString("base64")}`;
}

/**
 * Check if an image URL is from Supabase storage
 */
export function isSupabaseImage(url: string): boolean {
  return url.includes("supabase.co") || url.includes("supabase.in");
}

/**
 * Optimize Supabase storage URLs with transformation parameters
 */
export function optimizeSupabaseImage(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "jpeg" | "png";
  }
): string {
  if (!isSupabaseImage(url)) {
    return url;
  }

  const params = new URLSearchParams();
  
  if (options?.width) params.append("width", options.width.toString());
  if (options?.height) params.append("height", options.height.toString());
  if (options?.quality) params.append("quality", options.quality.toString());
  if (options?.format) params.append("format", options.format);

  const separator = url.includes("?") ? "&" : "?";
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}
