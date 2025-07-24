"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

interface FallbackImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function FallbackImage({
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  priority = false,
}: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [errorCount, setErrorCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Extract book title for better fallback display
  const bookTitle = alt.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  // Create a unique seed from the book title or src for consistent fallback images
  const createSeed = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const seed = createSeed(bookTitle || src || alt);

  // Define fallback sources in order of preference
  const getFallbackSrc = (count: number) => {
    switch (count) {
      case 0:
        return src || "/placeholder.jpg"; // Original source or default placeholder
      case 1:
        return "/placeholder.jpg"; // Local placeholder image
      case 2:
        return `https://picsum.photos/seed/${seed}/400/600`; // Random image with consistent seed
      case 3:
        return "/fallback.jpeg"; // Another local fallback
      case 4:
        return `https://via.placeholder.com/400x600/6366f1/ffffff?text=${encodeURIComponent(
          bookTitle.substring(0, 20) || "Book"
        )}`; // Colored placeholder with text
      default:
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f3f4f6'/%3E%3C/svg%3E"; // SVG fallback
    }
  };

  useEffect(() => {
    // Reset state when src changes
    setCurrentSrc(src);
    setErrorCount(0);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    const nextErrorCount = errorCount + 1;
    setErrorCount(nextErrorCount);

    if (nextErrorCount >= 5) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const nextSrc = getFallbackSrc(nextErrorCount);
    setCurrentSrc(nextSrc);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Final fallback UI when all image sources fail
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className} ${
          fill ? "absolute inset-0" : "w-full h-full"
        }`}
      >
        <div className="flex flex-col items-center justify-center p-4 text-gray-600">
          <div className="bg-white rounded-full p-3 shadow-sm mb-3">
            <BookOpen className="w-8 h-8 text-gray-500" />
          </div>
          <div className="text-sm text-center font-medium max-w-[90%] leading-tight">
            {bookTitle || "Book Cover"}
          </div>
          <div className="text-xs text-gray-400 mt-1">Image unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className={fill ? "absolute inset-0" : "relative w-full h-full"}>
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className={`flex items-center justify-center bg-gray-100 animate-pulse ${
            fill ? "absolute inset-0" : "w-full h-full"
          }`}
        >
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
      )}

      <Image
        src={currentSrc}
        alt={alt}
        fill={fill}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        unoptimized={errorCount > 1} // Use unoptimized for fallback images after first fallback
      />
    </div>
  );
}
