"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { getBlurDataURL } from "@/lib/image-utils";

interface LazyImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  fallback?: React.ReactNode;
}

/**
 * Optimized lazy-loading image component with loading states
 */
export function LazyImage({ 
  src, 
  alt, 
  className = "",
  fallback,
  ...props 
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 w-full h-full">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Failed to load image
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        {...props}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
