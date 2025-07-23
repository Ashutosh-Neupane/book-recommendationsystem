"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { BookOpen } from "lucide-react"

interface BookCoverImageProps {
  title: string
  author?: string
  isbn?: string
  size?: number
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export default function BookCoverImage({
  title,
  author,
  isbn,
  size = 200,
  width,
  height,
  className = "",
  priority = false,
}: BookCoverImageProps) {
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [allSourcesFailed, setAllSourcesFailed] = useState(false)

  const imageWidth = width || size
  const imageHeight = height || Math.floor(size * 1.5)
  
  // Generate a consistent color based on the title
  const generateColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = Math.abs(hash) % 360
    return `hsl(${hue}, 70%, 60%)`
  }

  // Try multiple image sources in order of preference
  const imageSources = [
    // OpenLibrary ISBN (most reliable if ISBN exists)
    isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null,
    // Google Books API
    `https://books.google.com/books/content?id=${encodeURIComponent(title)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`,
    // OpenLibrary title search
    `https://covers.openlibrary.org/b/title/${encodeURIComponent(title.toLowerCase())}-L.jpg`,
    // Unsplash book-related image
    `https://source.unsplash.com/featured/?book,${encodeURIComponent(title)}`,
    // Amazon placeholder (if all else fails)
    `https://m.media-amazon.com/images/I/51Ga5GuElyL._AC_SY780_.jpg`,
    // Local placeholder as last resort
    `/placeholder.svg?height=${imageHeight}&width=${imageWidth}&text=${encodeURIComponent(title)}`,
  ].filter(Boolean) as string[]

  const fallbackCover = (
    <div
      className={`flex flex-col items-center justify-center text-white p-4 rounded-lg shadow-lg ${className}`}
      style={{
        width: imageWidth,
        height: imageHeight,
        background: `linear-gradient(135deg, ${generateColor(title)}, ${generateColor(title + "dark")})`,
      }}
    >
      <BookOpen className="w-12 h-12 mb-2 opacity-80" />
      <div className="text-center">
        <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-3">{title}</h3>
        {author && <p className="text-xs opacity-90 line-clamp-2">{author}</p>}
      </div>
    </div>
  )

  const handleImageError = () => {
    if (currentSourceIndex < imageSources.length - 1) {
      // Try next source
      setCurrentSourceIndex(currentSourceIndex + 1)
    } else {
      // All sources failed
      setAllSourcesFailed(true)
      setLoading(false)
    }
  }

  // Reset when title/isbn changes
  useEffect(() => {
    setCurrentSourceIndex(0)
    setAllSourcesFailed(false)
    setLoading(true)
  }, [title, isbn])

  if (allSourcesFailed || !imageSources.length) {
    return fallbackCover
  }

  return (
    <div className={`relative ${className}`} style={{ width: imageWidth, height: imageHeight }}>
      {loading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center"
          style={{ width: imageWidth, height: imageHeight }}
        >
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
      )}

      <Image
        src={imageSources[currentSourceIndex]}
        alt={`Cover of ${title}`}
        width={imageWidth}
        height={imageHeight}
        className={`rounded-lg shadow-lg object-cover ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={handleImageError}
        priority={priority}
        unoptimized
      />

      {allSourcesFailed && fallbackCover}
    </div>
  )
}
