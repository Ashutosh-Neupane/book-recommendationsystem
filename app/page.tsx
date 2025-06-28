"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, Heart, Star, Rocket, Filter, User, LogOut, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LoginForm from "./components/login-form"
import VirtualBookGrid from "./components/virtual-book-grid"
import { generateSampleBooks } from "./utils/book-generator"

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

interface CosmicLibraryUser {
  id: number
  name: string
  email: string
  avatar?: string
  joinDate: string
}

// Generate 2000+ sample books for demonstration
const allBooks = generateSampleBooks(2000)

const BOOKS_PER_PAGE = 24 // Optimal for grid layout

export default function CosmicLibraryApp() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [favorites, setFavorites] = useState<number[]>([])
  const [sortBy, setSortBy] = useState("rating")
  const [cosmicLibraryUser, setCosmicLibraryUser] = useState<CosmicLibraryUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"pagination" | "virtual">("pagination")

  const genres = useMemo(() => ["all", ...Array.from(new Set(allBooks.map((book) => book.genre)))], [])

  // Memoized filtering and sorting for performance
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = allBooks

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.genre.toLowerCase().includes(searchLower),
      )
    }

    // Apply genre filter
    if (selectedGenre !== "all") {
      filtered = filtered.filter((book) => book.genre === selectedGenre)
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "year") return b.year - a.year
      if (sortBy === "title") return a.title.localeCompare(b.title)
      if (sortBy === "author") return a.author.localeCompare(b.author)
      return 0
    })
  }, [searchTerm, selectedGenre, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedBooks.length / BOOKS_PER_PAGE)
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE
    return filteredAndSortedBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE)
  }, [filteredAndSortedBooks, currentPage])

  // Reset to first page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const toggleFavorite = useCallback(
    (bookId: number) => {
      if (!cosmicLibraryUser) {
        setShowLogin(true)
        return
      }
      setFavorites((prev) => (prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]))
    },
    [cosmicLibraryUser],
  )

  const handleLogin = (userData: CosmicLibraryUser) => {
    setCosmicLibraryUser(userData)
    setShowLogin(false)
  }

  const handleLogout = () => {
    setCosmicLibraryUser(null)
    setFavorites([])
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    handleFilterChange()
  }

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value)
    handleFilterChange()
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    handleFilterChange()
  }

  const BookCard = ({ book }: { book: Book }) => (
    <Card className="group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-slate-900/50 to-purple-900/20 border-purple-500/20 backdrop-blur-sm">
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
            onClick={() => toggleFavorite(book.id)}
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

  const PaginationControls = () => (
    <div className="flex items-center justify-between mt-8 p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/20">
      <div className="text-purple-300 text-sm">
        Showing {(currentPage - 1) * BOOKS_PER_PAGE + 1} to{" "}
        {Math.min(currentPage * BOOKS_PER_PAGE, filteredAndSortedBooks.length)} of {filteredAndSortedBooks.length} books
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="bg-black/30 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNum)}
                className={
                  currentPage === pageNum
                    ? "bg-purple-600 text-white"
                    : "bg-black/30 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                }
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="bg-black/30 border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const featuredBooks = useMemo(() => allBooks.filter((book) => book.rating >= 4.5).slice(0, 12), [])
  const favoriteBooks = useMemo(() => allBooks.filter((book) => favorites.includes(book.id)), [favorites])

  return (
    <div className="min-h-screen relative">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-black/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Rocket className="h-8 w-8 text-purple-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Cosmic Library
                </h1>
                <p className="text-xs text-purple-300">
                  Explore {allBooks.length.toLocaleString()} Books Across the Universe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search across the galaxy..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-64 bg-black/30 border-purple-500/30 text-purple-100 placeholder:text-purple-400"
                />
              </div>

              {cosmicLibraryUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-purple-200">
                    <Avatar className="h-8 w-8 border border-purple-500/30">
                      <AvatarImage src={cosmicLibraryUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {cosmicLibraryUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Welcome, {cosmicLibraryUser.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Join the Crew
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30 border border-purple-500/20">
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Discover
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              My Constellation ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Stellar Picks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Filters and View Mode */}
            <div className="flex items-center justify-between gap-4 p-4 bg-black/20 backdrop-blur-sm rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-purple-400" />
                <Select value={selectedGenre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-purple-200">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/30">
                    {genres.map((genre) => (
                      <SelectItem key={genre} value={genre} className="text-purple-200 focus:bg-purple-600/20">
                        {genre === "all" ? "All Galaxies" : genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48 bg-black/30 border-purple-500/30 text-purple-200">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/30">
                    <SelectItem value="rating" className="text-purple-200 focus:bg-purple-600/20">
                      Highest Rated
                    </SelectItem>
                    <SelectItem value="year" className="text-purple-200 focus:bg-purple-600/20">
                      Newest First
                    </SelectItem>
                    <SelectItem value="title" className="text-purple-200 focus:bg-purple-600/20">
                      Title A-Z
                    </SelectItem>
                    <SelectItem value="author" className="text-purple-200 focus:bg-purple-600/20">
                      Author A-Z
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-purple-300 text-sm">View:</span>
                <Select value={viewMode} onValueChange={(value: "pagination" | "virtual") => setViewMode(value)}>
                  <SelectTrigger className="w-32 bg-black/30 border-purple-500/30 text-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/30">
                    <SelectItem value="pagination" className="text-purple-200 focus:bg-purple-600/20">
                      Pages
                    </SelectItem>
                    <SelectItem value="virtual" className="text-purple-200 focus:bg-purple-600/20">
                      Scroll
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Books Display */}
            {viewMode === "pagination" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
                {totalPages > 1 && <PaginationControls />}
              </>
            ) : (
              <VirtualBookGrid books={filteredAndSortedBooks} favorites={favorites} onToggleFavorite={toggleFavorite} />
            )}

            {filteredAndSortedBooks.length === 0 && (
              <div className="text-center py-12">
                <Rocket className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-purple-200">No books found in this sector</h3>
                <p className="text-purple-400">Try adjusting your search coordinates or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {favoriteBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-purple-200">Your constellation is empty</h3>
                <p className="text-purple-400">
                  {cosmicLibraryUser
                    ? "Start adding books to your personal constellation by clicking the heart icon"
                    : "Join the crew to start building your personal constellation"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Stellar Picks
              </h2>
              <p className="text-purple-300">Highly rated books recommended by our cosmic community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="bg-slate-900 border-purple-500/30 text-purple-100">
          <DialogHeader>
            <DialogTitle className="text-center text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Join the Cosmic Library
            </DialogTitle>
          </DialogHeader>
          <LoginForm onLogin={handleLogin} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
