import { fetchBookById, fetchBookByIdFromAPI } from "@/lib/books-data";
import { getReviewsByBookId } from "@/lib/reviews-data";
import { notFound } from "next/navigation";
import BookDetailClient from "./components/BookDetails";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BookDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const bookId = params.id;

  try {
    // Try to fetch book from MongoDB first
    let book = await fetchBookById(bookId);
    let reviewsData = await getReviewsByBookId(bookId);

    // If Mongo fetch fails, try API fallback
    if (!book) {
      book = await fetchBookByIdFromAPI(bookId);
    }

    // If book still not found, show fallback UI
    if (!book) {
      console.error(`Book with ID ${bookId} not found in database`);

      const fallbackBook = {
        id: bookId,
        title: "Book Details",
        author: "Unknown Author",
        description: "Book details are currently unavailable.",
        coverImage: "/placeholder.svg",
        rating: 0,
        publishedYear: 0,
        genre: ["Unknown"],
        isbn: "N/A",
        pages: 0,
        language: "Unknown",
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Books</span>
                </Button>
              </Link>
            </div>

            <BookDetailClient
              bookId={bookId}
              initialBook={fallbackBook}
              initialBookReviews={[]}
            />
          </div>
        </div>
      );
    }

    // **Pass reviews data as is — no remapping!**
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="ghost"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Books</span>
              </Button>
            </Link>
          </div>

          <BookDetailClient
            bookId={bookId}
            initialBook={book}
            initialBookReviews={reviewsData}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading book details:", error);
    return notFound();
  }
}
