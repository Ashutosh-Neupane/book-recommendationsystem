"use client"

import { useEffect, useState } from "react"
import { Star, TrendingUp, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import BookCoverImage from "./bookCoverImage"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Book } from "@/lib/books-data"

interface HeroSectionProps {
  userName?: string
}

export default function HeroSection({ userName }: HeroSectionProps) {
  const [topRatedBooks, setTopRatedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchTopRatedBooks = async () => {
      try {
        const response = await fetch("/api/books/top-rated")
        if (response.ok) {
          const data = await response.json()
          setTopRatedBooks(data.books || [])
        }
      } catch (error) {
        console.error("Error fetching top rated books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopRatedBooks()
  }, [])

  useEffect(() => {
    if (topRatedBooks.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(topRatedBooks.length / 4))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [topRatedBooks.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(topRatedBooks.length / 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(topRatedBooks.length / 4)) % Math.ceil(topRatedBooks.length / 4))
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center space-y-6">
            <div className="h-12 bg-white/20 rounded-lg animate-pulse mx-auto max-w-md" />
            <div className="h-6 bg-white/20 rounded-lg animate-pulse mx-auto max-w-lg" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white/20 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const booksPerSlide = 4
  const totalSlides = Math.ceil(topRatedBooks.length / booksPerSlide)
  const currentBooks = topRatedBooks.slice(currentSlide * booksPerSlide, (currentSlide + 1) * booksPerSlide)

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="absolute inset-0 bg-black/20" />

      <div className="relative container mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium">Top Rated Collection</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Welcome back{userName ? `, ${userName}` : ""}!
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover our highest-rated literary treasures, curated just for passionate readers like you
          </p>

          <div className="flex items-center justify-center space-x-8 text-sm text-blue-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Now</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>Top Rated</span>
            </div>
          </div>
        </div>

        {/* Books Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentBooks.map((book, index) => (
                <Card
                  key={book.id}
                  className="group cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
                  onClick={() => router.push(`/book/${book.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* Rank Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        #{currentSlide * booksPerSlide + index + 1}
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-white" />
                        <span>{book.rating}</span>
                      </div>

                      {/* Book Cover */}
                      <div className="relative h-80 overflow-hidden">
                        <BookCoverImage title={book.title} size={320} />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Hover Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <p className="text-sm line-clamp-3 leading-relaxed">{book.description}</p>
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="font-bold text-lg text-white line-clamp-2 group-hover:text-blue-200 transition-colors duration-300">
                            {book.title}
                          </h3>
                          <p className="text-blue-200 text-sm font-medium mt-1">by {book.author}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {book.genre.slice(0, 2).map((genre) => (
                            <Badge
                              key={genre}
                              variant="secondary"
                              className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors duration-200"
                            >
                              {genre}
                            </Badge>
                          ))}
                          {book.genre.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-blue-200 border-white/20">
                              +{book.genre.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-blue-200 pt-2 border-t border-white/20">
                          <span>{book.publishedYear}</span>
                          <span>{book.pages} pages</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white rounded-full"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white" : "bg-white/30"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            onClick={() => router.push("/search")}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
          >
            <span>Explore More Books</span>
            <TrendingUp className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
