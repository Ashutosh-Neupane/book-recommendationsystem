"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [books, setBooks] = useState<Book[]>(initialBooks || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [sortBy, setSortBy] = useState("createdAt");

  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number.parseInt(searchParams.get("page") || "1");
  const genre = searchParams.get("genre") || "";
  const author = searchParams.get("author") || "";
  const searchTerm = searchParams.get("search") || "";

  const processBook = (book: any): Book => ({
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
  });

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "24",
        sortBy,
        sortOrder: "desc",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (genre) params.append("genre", genre);
      if (author) params.append("author", author);

      const response = await fetch(`/api/books?${params}`);
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
  }, [currentPage, searchTerm, genre, author, sortBy]);

  useEffect(() => {
    if (!initialBooks || searchTerm || genre || author || currentPage > 1) {
      fetchBooks();
    } else {
      setBooks(initialBooks.map(processBook));
    }
  }, [fetchBooks, initialBooks, searchTerm, genre, author, currentPage]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const {
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      maxPagesInBatch,
    } = pagination;
    const maxDisplayPages = Math.min(totalPages, maxPagesInBatch);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(maxDisplayPages, startPage + 4);
    const adjustedStartPage = Math.max(1, endPage - 4);

    const pageNumbers = [];
    for (let i = adjustedStartPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                className="w-10"
              >
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

          {endPage < maxDisplayPages && (
            <>
              {endPage < maxDisplayPages - 1 && (
                <span className="px-2">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(maxDisplayPages)}
                className="w-10"
              >
                {maxDisplayPages}
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
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Discover Books
        </h1>
        <p className="text-gray-600 text-lg">
          Explore our vast collection of books across all genres
        </p>
      </div>

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

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button onClick={fetchBooks} variant="outline">
            <Loader2 className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {books.map((book) => (
              <BookCard key={book.id || book._id} book={book} user={user} />
            ))}
          </div>
          {renderPagination()}
          {pagination && (
            <div className="text-center mt-4 text-sm text-gray-600">
              Showing {books.length} of {pagination.totalBooks} books
            </div>
          )}
        </>
      )}

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
