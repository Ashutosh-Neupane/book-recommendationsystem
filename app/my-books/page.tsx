"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import BookCard from "@/components/book-card"
import { getCurrentUser, type AuthUser } from "@/lib/auth"
import { fetchBooksFromMongo, type Book as BookType } from "@/lib/books-data"
import { fetchReviewsFromMongo } from "@/lib/reviews-data"

export default function MyBooksPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [books, setBooks] = useState<BookType[]>([])
  const [userReviewedBookIds, setUserReviewedBookIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }
        setUser(currentUser)

        const [booksData, reviewsData] = await Promise.all([fetchBooksFromMongo(), fetchReviewsFromMongo()])

        setBooks(booksData)

        const reviewedBookIds = new Set(
          reviewsData.filter((review) => review.userId === currentUser.id).map((review) => review.bookId),
        )
        setUserReviewedBookIds(reviewedBookIds)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">Loading your books...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const readBooks = books.filter((book) => userReviewedBookIds.has(book.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Books</h1>

        <section>
          <h2 className="text-2xl font-bold mb-4">Books I've Reviewed</h2>
          {readBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {readBooks.map((book) => (
                <BookCard key={book.id} book={book} isInitiallyInWishlist={false} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No books reviewed yet. Start reading and share your thoughts!</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
