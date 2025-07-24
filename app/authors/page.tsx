"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AuthorImage from "@/components/AuthorImage";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Pagination from "@/components/pagination";

interface Author {
  name: string;
  bio: string;
  bookCount: number;
}

const AUTHORS_PER_PAGE = 24;

const AuthorCard = ({ author }: { author: Author }) => {
  const normalizedAuthorName = encodeURIComponent(author.name);

  return (
    <Link
      href={`/authors/${normalizedAuthorName}`}
      className="block"
      aria-label={`View profile of ${author.name}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm transition-transform duration-300 hover:shadow-2xl hover:scale-105 border border-white/20">
        <div className="relative h-64 w-full rounded-t-xl overflow-hidden bg-gray-100">
          <AuthorImage authorName={author.name} size={256} />
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {author.name}
          </h2>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {author.bio}
          </p>
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-transparent"
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search term (optional, basic implementation)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAuthors(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchAuthors = useCallback(async (page: number, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/authors", window.location.origin);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", AUTHORS_PER_PAGE.toString());
      if (search.trim()) url.searchParams.set("search", search.trim());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setAuthors(data.authors || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalAuthors(data.pagination?.totalAuthors || 0);
      setCurrentPage(data.pagination?.currentPage || page);
    } catch (err) {
      console.error("Failed to fetch authors:", err);
      setError("Failed to load authors. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== currentPage) {
        fetchAuthors(page, searchTerm);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentPage, fetchAuthors, searchTerm]
  );

  useEffect(() => {
    fetchAuthors(1, searchTerm);
  }, [fetchAuthors, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <header className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Authors
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore the brilliant minds behind our collection of books.
          </p>

          <input
            type="search"
            placeholder="Search authors by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search authors by name"
          />

          {totalAuthors > 0 && !loading && (
            <p className="mt-4 text-sm text-gray-500">
              Showing {authors.length} of {totalAuthors} authors
            </p>
          )}
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && authors.length === 0 ? (
          // Full page loader on initial load
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        ) : authors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No authors found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or come back later.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12 ${
                loading ? "opacity-70 pointer-events-none" : ""
              }`}
            >
              {authors.map((author) => (
                <AuthorCard key={author.name} author={author} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
