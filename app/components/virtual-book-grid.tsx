"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { Heart, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Book {
  id: number
  title: string
  author: string
  genre: string
  rating: number
  description: string
  cover: string
  year: number
  pages: number
}

interface VirtualBookGridProps {
  books: Book[]
  favorites: number[]
  onToggleFavorite: (bookId: number) => void
}

const ITEM_HEIGHT = 400 // Approximate height of each book card
const ITEMS_PER_ROW = 4 // Default items per row
const BUFFER_SIZE = 5 // Number of extra rows to render

export default function VirtualBookGrid({ books, favorites, onToggleFavorite }: VirtualBookGridProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)
  const [itemsPerRow, setItemsPerRow] = useState(ITEMS_PER_ROW)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate responsive items per row
  useEffect(() => {
    const updateItemsPerRow = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        if (width < 768) setItemsPerRow(1)
        else if (width < 1024) setItemsPerRow(2)
        else if (width < 1280) setItemsPerRow(3)
        else setItemsPerRow(4)
      }
    }

    updateItemsPerRow()
    window.addEventListener("resize", updateItemsPerRow)
    return () => window.removeEventListener("resize", updateItemsPerRow)
  }, [])

  // Calculate visible items
  const visibleItems = useMemo(() => {
    const totalRows = Math.ceil(books.length / itemsPerRow)
    const startRow = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE)

    const startIndex = startRow * itemsPerRow
    const endIndex = Math.min(books.length, endRow * itemsPerRow)

    return {
      startIndex,
      endIndex,
      startRow,
      totalRows,
      items: books.slice(startIndex, endIndex),
    }
  }, [books, scrollTop, containerHeight, itemsPerRow])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight)
    }
  }, [])

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-slate-900/50 to-purple-900/20 border-purple-500/20 backdrop-blur-sm h-full">
      <CardHeader className="pb-2">
        <div className="relative">
          <img
            src={book.cover || "/placeholder.svg"}
            alt={book.title}
            className="w-full h-48 object-cover rounded-md mb-3 border border-purple-500/20"
            loading="lazy"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 border border-purple-500/30"
            onClick={() => onToggleFavorite(book.id)}
          >
            <Heart
              className={`h-4 w-4 ${favorites.includes(book.id) ? "fill-pink-500 text-pink-500" : "text-purple-300"}`}
            />
          </Button>
          <div className="absolute top-2 left-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2 text-purple-100">{book.title}</CardTitle>
        <CardDescription className="text-sm text-purple-300">by {book.author}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-purple-200">{book.rating}</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-purple-600/30 text-purple-200 border-purple-500/30">
            {book.genre}
          </Badge>
        </div>
        <p className="text-sm text-purple-300/80 line-clamp-3 mb-3">{book.description}</p>
        <div className="flex items-center justify-between text-xs text-purple-400">
          <span>{book.year}</span>
          <span>{book.pages} pages</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div ref={containerRef} className="h-[800px] overflow-auto" onScroll={handleScroll}>
      <div
        style={{
          height: visibleItems.totalRows * ITEM_HEIGHT,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: visibleItems.startRow * ITEM_HEIGHT,
            left: 0,
            right: 0,
          }}
        >
          <div
            className={`grid gap-6 ${
              itemsPerRow === 1
                ? "grid-cols-1"
                : itemsPerRow === 2
                  ? "grid-cols-2"
                  : itemsPerRow === 3
                    ? "grid-cols-3"
                    : "grid-cols-4"
            }`}
          >
            {visibleItems.items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
