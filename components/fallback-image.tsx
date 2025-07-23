"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BookOpen } from "lucide-react"

interface FallbackImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

export default function FallbackImage({ src, alt, fill = false, className = '', sizes, priority = false }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [errorCount, setErrorCount] = useState(0)
  const [hasError, setHasError] = useState(false)
  
  // Extract book title and ID for alternative sources
  const bookTitle = alt.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  const bookId = src.split('/').pop()?.split('.')[0] || ''
  
  // Define fallback sources in order of preference
  const getFallbackSrc = (count: number) => {
    switch (count) {
      case 0: return src // Original source
      case 1: return `/placeholder.jpg` // Local placeholder image
      case 2: return `https://picsum.photos/seed/${bookId}/400/600` // Random image with consistent seed
      case 3: return `/fallback.jpeg` // Another local fallback
      default: return "/placeholder.svg" // Final fallback
    }
  }
  
  useEffect(() => {
    setCurrentSrc(src)
    setErrorCount(0)
    setHasError(false)
  }, [src])
  
  const handleError = () => {
    const nextErrorCount = errorCount + 1
    setErrorCount(nextErrorCount)
    const nextSrc = getFallbackSrc(nextErrorCount)
    setCurrentSrc(nextSrc)
    
    if (nextErrorCount >= 4) {
      setHasError(true)
    }
  }
  
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className} ${fill ? 'absolute inset-0' : ''}`}>
        <div className="flex flex-col items-center justify-center p-4 text-gray-500">
          <BookOpen className="w-8 h-8 mb-2" />
          <div className="text-xs text-center font-medium">{bookTitle || alt}</div>
        </div>
      </div>
    )
  }
  
  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={handleError}
      priority={priority}
      loading={priority ? "eager" : "lazy"}
      unoptimized={errorCount > 0} // Use unoptimized for fallback images
    />
  )
}