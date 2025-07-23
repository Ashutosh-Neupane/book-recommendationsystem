"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import BookCard from "@/components/book-card"
import { getCurrentUser, type AuthUser } from "@/lib/auth"
import { fetchBooksFromMongo, type Book as BookType } from "@/lib/books-data"
import { getWishlist } from "@/lib/wishlist"

export default function WishlistPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [books, setBooks] = useState<BookType[]>([])
  const [wishlistBookIds, setWishlistBookIds] = useState<Set<string>>(new Set())
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

        const [booksData, wishlistData] = await Promise.all([fetchBooksFromMongo(), getWishlist()])

        setBooks(booksData)

        if (wishlistData) {
          const ids = new Set(wishlistData.map((item) => item.bookId))
          setWishlistBookIds(ids)
        }
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
        <p className="text-xl">Loading your wishlist...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const wishlistBooks = books.filter((book) => wishlistBookIds.has(book.id))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        <section>
          {wishlistBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {wishlistBooks.map((book) => (
                <BookCard key={book.id} book={book} isInitiallyInWishlist={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Your wishlist is empty. Add some books you'd like to read!</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
