"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Loader2 } from "lucide-react";
import { Book } from "@/lib/books-data";
import BookCard from "./book-card";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  maxPagesInBatch: number;
}

interface BooksClientProps {
  initialBooks: Book[];
  genres: string[];
  user: {
    name: string;
    email: string;
  } | null;
}

export default function BooksClient({
  initialBooks,
  genres,
  user,
}: BooksClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract filters/search/sort from URL params
  const searchTerm = searchParams.get("search") || "";
  const genre = searchParams.get("genre") || "";
  const author = searchParams.get("author") || "";
  const batch = Number.parseInt(searchParams.get("batch") || "1");
  const batchSize = 1000; // number of books per batch (backend config)
  const pageLimit = 24; // books per page

  // We'll get current page within batch (default 1)
  const batchPage = Number.parseInt(searchParams.get("page") || "1");

  // State
  const [books, setBooks] = useState<Book[]>(() =>
    initialBooks.map(processBook)
  );
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const booksContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loading && booksContainerRef.current) {
      booksContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [books, loading]);

  // Process raw book object to consistent shape
  function processBook(book: any): Book {
    return {
      ...book,
      id: book._id || book.id,
      title: book.title || "Untitled",
      author: book.author || "Unknown Author",
      description:
        book.description || book.summary || "No description available.",
      genre: Array.isArray(book.genres)
        ? book.genres
        : Array.isArray(book.genre)
        ? book.genre
        : typeof book.genres === "string"
        ? [book.genres]
        : ["General"],
      publishedYear: book.year || book.publishedYear || 2023,
      pages: book.pages || 300,
      coverImage:
        book.img_l || book.coverImage || book.image || "/placeholder.svg",
      rating: book.rating || 4.5,
      reviewCount: book.reviewCount || Math.floor(Math.random() * 500) + 10,
      isbn: book.isbn || "N/A",
      language: book.language || "English",
    };
  }

  // Fetch books from API for given batch and page
  const fetchBooks = useCallback(
    async (batchToFetch: number, pageToFetch: number) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          batch: batchToFetch.toString(),
          page: pageToFetch.toString(),
          limit: pageLimit.toString(),
          sortBy,
          sortOrder: "desc",
        });

        if (searchTerm) params.append("search", searchTerm);
        if (genre) params.append("genre", genre);
        if (author) params.append("author", author);

        const response = await fetch(`/api/books?${params.toString()}`);

        if (!response.ok) throw new Error("Failed to fetch books");

        const data = await response.json();

        const processedBooks = (data.books || []).map(processBook);

        setBooks(processedBooks);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books. Please try again.");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, genre, author, sortBy]
  );

  // On filters/search/sort/batch/page change, fetch books
  useEffect(() => {
    fetchBooks(batch, batchPage);
  }, [fetchBooks, batch, batchPage]);

  // Calculate max pages in current batch and global pages
  const maxPagesInBatch =
    pagination?.maxPagesInBatch || Math.floor(batchSize / pageLimit);

  // Calculate global current page: (batch-1)*maxPagesInBatch + batchPage
  const currentGlobalPage = (batch - 1) * maxPagesInBatch + batchPage;

  // Total global pages based on total books and limit per page
  const totalGlobalPages = pagination
    ? Math.ceil(pagination.totalBooks / pageLimit)
    : maxPagesInBatch; // fallback

  // Navigate to specific global page, adjusting batch and page params
  const goToPage = (pageNum: number) => {
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalGlobalPages) pageNum = totalGlobalPages;

    const newBatch = Math.floor((pageNum - 1) / maxPagesInBatch) + 1;
    const newBatchPage = ((pageNum - 1) % maxPagesInBatch) + 1;

    const params = new URLSearchParams(searchParams);
    params.set("batch", newBatch.toString());
    params.set("page", newBatchPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handlePrev = () => {
    if (currentGlobalPage > 1) {
      goToPage(currentGlobalPage - 1);
    }
  };

  const handleNext = () => {
    if (currentGlobalPage < totalGlobalPages) {
      goToPage(currentGlobalPage + 1);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);

    // Reset batch and page to 1
    const params = new URLSearchParams(searchParams);
    params.set("batch", "1");
    params.set("page", "1");
    params.set("sortBy", newSortBy);
    router.push(`?${params.toString()}`);
  };

  // Loading skeleton UI
  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {Array.from({ length: pageLimit }).map((_, idx) => (
        <Card key={idx} className="overflow-hidden">
          <Skeleton className="h-64 w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-3 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Discover Books
        </h1>
        <p className="text-gray-600 text-lg">
          Explore our vast collection of books across all genres
        </p>
      </div>

      {/* Filter and Sort */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="author">Author A-Z</SelectItem>
                <SelectItem value="reviewCount">Most Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(genre || author || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {genre && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Genre: {genre}
                </div>
              )}
              {author && (
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Author: {author}
                </div>
              )}
              {searchTerm && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Search: {searchTerm}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && renderLoadingSkeletons()}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button
            onClick={() => fetchBooks(batch, batchPage)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Books Grid */}
      {!loading && !error && books.length > 0 && (
        <div ref={booksContainerRef}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {books.map((book) => (
              <BookCard key={book.id || book._id} book={book} user={user} />
            ))}
          </div>

          {/* Prev / Next Pagination */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button onClick={handlePrev} disabled={currentGlobalPage <= 1}>
              Prev
            </Button>

            <span className="flex items-center">
              Page {currentGlobalPage} of {totalGlobalPages}
            </span>

            <Button
              onClick={handleNext}
              disabled={currentGlobalPage >= totalGlobalPages}
            >
              Next
            </Button>
          </div>

          {/* Showing count */}
          {pagination && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing {books.length} of {pagination.totalBooks} books
            </div>
          )}
        </div>
      )}

      {/* No Books Found */}
      {!loading && !error && books.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse our collection
          </p>
          <Button onClick={() => router.push("/books")} variant="outline">
            Browse All Books
          </Button>
        </div>
      )}
    </div>
  );
}
