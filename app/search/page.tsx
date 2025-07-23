"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import type { Book } from "@/lib/books-data"
import BookCard from "@/components/book-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Pagination from "@/components/pagination"

const BOOKS_PER_PAGE = 20

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchSearchResults = async (page: number) => {
    if (!query.trim()) {
      setBooks([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${BOOKS_PER_PAGE}`)
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error("Failed to search books:", error)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchSearchResults(1)
  }, [query])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchSearchResults(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-[95vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex justify-center items-center py-20">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Searching...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[95vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Search Results for: <span className="text-blue-600">"{query}"</span>
        </h1>
        {total > 0 && (
          <p className="text-gray-600">
            Found {total} book{total !== 1 ? "s" : ""} matching your search
          </p>
        )}
      </div>

      {books.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No books found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any books matching "{query}". Try different keywords or check your spelling.
          </p>
          <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
            {books.map((book) => (
              <BookCard key={book.id} book={book} isInitiallyInWishlist={false} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
