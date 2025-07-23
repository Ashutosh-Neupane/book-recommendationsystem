"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronLeft, ChevronRight, BookOpen, TrendingUp } from "lucide-react"

interface Genre {
  _id: string
  name: string
  description?: string
  totalBooks: number
  averageRating: number
  popularity: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalGenres: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number.parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    fetchGenres()
  }, [currentPage, searchTerm])

  const fetchGenres = async () => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "24",
      })

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/genres?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch genres")
      }

      const data = await response.json()
      setGenres(data.genres || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching genres:", err)
      setError("Failed to load genres. Please try again.")
      setGenres([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const getGenreGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-pink-500 to-rose-600",
      "from-yellow-500 to-orange-600",
      "from-indigo-500 to-blue-600",
      "from-purple-500 to-pink-600",
      "from-teal-500 to-green-600",
      "from-orange-500 to-red-600",
    ]
    return gradients[index % gradients.length]
  }

  const renderPagination = () => {
    if (!pagination) return null

    const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination

    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    const adjustedStartPage = Math.max(1, endPage - 4)

    const pageNumbers = []
    for (let i = adjustedStartPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-12">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-1">
          {adjustedStartPage > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} className="w-10">
                1
              </Button>
              {adjustedStartPage > 2 && <span className="px-2">...</span>}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className="w-10"
            >
              {pageNum}
            </Button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} className="w-10">
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Explore Genres
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover books across different genres and find your next favorite read
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search genres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 24 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <Button onClick={fetchGenres} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Genres Grid */}
        {!loading && !error && genres.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {genres.map((genre, index) => (
                <Link key={genre._id} href={`/genres/${encodeURIComponent(genre.name)}`}>
                  <Card className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/80 backdrop-blur-sm border-white/20 overflow-hidden">
                    {/* Gradient Header */}
                    <div className={`h-32 bg-gradient-to-br ${getGenreGradient(index)} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white truncate">{genre.name}</h3>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {genre.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{genre.description}</p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{genre.totalBooks} books</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700">
                              {(genre.averageRating || 0).toFixed(1)}
                            </span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= (genre.averageRating || 0) ? "text-yellow-400" : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Popularity: {genre.popularity}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium"
                          >
                            Explore →
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* Results Info */}
            {pagination && (
              <div className="text-center mt-8 text-gray-600">
                Showing {genres.length} of {pagination.totalGenres} genres
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && !error && genres.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No genres found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <Button onClick={() => router.push("/genres")} variant="outline">
              Browse All Genres
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
