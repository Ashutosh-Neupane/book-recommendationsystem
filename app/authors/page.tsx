"use client";

import { useState, useEffect } from "react";
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
    <Link href={`/authors/${normalizedAuthorName}`} className="block">
      <div className="relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105 border border-white/20">
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAuthors = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/authors?page=${page}&limit=${AUTHORS_PER_PAGE}`
      );
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch authors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAuthors(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading authors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-12">
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Authors
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Explore the brilliant minds behind our collection of books.
          </p>
          {total > 0 && (
            <p className="text-sm text-gray-500">
              Showing {authors.length} of {total} authors
            </p>
          )}
        </div>

        {authors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No authors found
            </h3>
            <p className="text-gray-500">Please try again later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
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
