"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Star,
  MessageSquare,
  Heart,
  BookOpen,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BookCoverImage from "@/components/bookCoverImage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import type { Book as BookType, Review } from "@/types";

interface BookDetailClientProps {
  bookId: string;
  initialBook: BookType;
  initialBookReviews: Review[];
}

export default function BookDetailClient({
  bookId,
  initialBook,
  initialBookReviews,
}: BookDetailClientProps) {
  const [book] = useState(initialBook);
  const [bookReviews, setBookReviews] = useState<Review[]>(initialBookReviews);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState<number>(0);
  const [reviewSubmissionLoading, setReviewSubmissionLoading] = useState(false);
  const [reviewSubmissionError, setReviewSubmissionError] = useState<
    string | null
  >(null);
  const [reviewSubmissionSuccess, setReviewSubmissionSuccess] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const { user } = useAuth();
  const { checkWishlistStatus, toggleWishlistStatus } = useWishlist();
  const { toast } = useToast();
  const router = useRouter();

  const isInWishlist = checkWishlistStatus(bookId);

  useEffect(() => {
    if (reviewSubmissionSuccess) {
      const timer = setTimeout(() => {
        setReviewSubmissionSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [reviewSubmissionSuccess]);

  const averageRating = useMemo(() => {
    if (bookReviews.length === 0) return book.rating || 0;
    const sum = bookReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / bookReviews.length;
  }, [bookReviews, book.rating]);

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      const newStatus = await toggleWishlistStatus(bookId);
      toast({
        title: newStatus ? "Added to Wishlist" : "Removed from Wishlist",
        description: newStatus
          ? `"${book.title}" has been added to your wishlist.`
          : `"${book.title}" has been removed from your wishlist.`,
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const submitReviewToMongo = async (
    reviewPayload: Omit<Review, "_id" | "createdAt" | "updatedAt">
  ) => {
    const token = getToken();
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewPayload),
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to submit review");
    return true;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmissionLoading(true);
    setReviewSubmissionError(null);
    setReviewSubmissionSuccess(false);

    if (!user) {
      setReviewSubmissionError("You must be logged in to submit a review.");
      setReviewSubmissionLoading(false);
      return;
    }

    if (!newReviewText.trim() || newReviewRating === 0) {
      setReviewSubmissionError("Please provide both a rating and review text.");
      setReviewSubmissionLoading(false);
      return;
    }

    try {
      const reviewPayload: Omit<Review, "_id" | "createdAt" | "updatedAt"> = {
        bookId,
        userId: user.id,
        userName: user.name,
        rating: newReviewRating,
        comment: newReviewText,
      };

      await submitReviewToMongo(reviewPayload);

      const newReview: Review = {
        _id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...reviewPayload,
      };

      setBookReviews((prev) => [newReview, ...prev]);
      setNewReviewText("");
      setNewReviewRating(0);
      setReviewSubmissionSuccess(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewSubmissionError(
        "An unexpected error occurred during review submission."
      );
    } finally {
      setReviewSubmissionLoading(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRate?: (rating: number) => void
  ) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 transition-colors duration-200 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          } ${
            interactive
              ? "cursor-pointer hover:text-yellow-400 hover:fill-yellow-400"
              : ""
          }`}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        {/* Book Info */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <BookCoverImage
                    title={book.title}
                    author={book.author}
                    isbn={book.isbn}
                    width={300}
                    height={450}
                    className="mx-auto lg:mx-0"
                    priority={true}
                  />

                  {/* Wishlist Heart Button */}
                  {user && (
                    <Button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      variant="outline"
                      size="icon"
                      className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                        isInWishlist
                          ? "text-pink-500 border-pink-200 hover:bg-pink-50"
                          : "text-gray-400 hover:text-pink-400 hover:border-pink-200"
                      }`}
                    >
                      {wishlistLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart
                          className={`h-5 w-5 transition-all duration-300 ${
                            isInWishlist ? "fill-pink-500" : ""
                          }`}
                        />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="flex-1 text-center lg:text-left">
                <CardTitle className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {book.title}
                </CardTitle>

                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <User className="h-5 w-5 text-gray-500" />
                  <CardDescription className="text-lg text-gray-700 font-medium">
                    by {book.author}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-gray-800">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600 font-medium">
                    ({bookReviews.length} review
                    {bookReviews.length !== 1 ? "s" : ""})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                  {book.genre.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium px-3 py-1"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-800 leading-relaxed mb-6 text-base lg:text-lg">
                  {book.description}
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {book.publishedYear && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <span className="font-semibold block">Published</span>
                        <span>{book.publishedYear}</span>
                      </div>
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <div>
                        <span className="font-semibold block">Pages</span>
                        <span>{book.pages}</span>
                      </div>
                    </div>
                  )}
                  {book.language && (
                    <div className="text-gray-600">
                      <span className="font-semibold block">Language</span>
                      <span>{book.language}</span>
                    </div>
                  )}
                  {book.isbn && (
                    <div className="text-gray-600">
                      <span className="font-semibold block">ISBN</span>
                      <span className="text-xs">{book.isbn}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Submission */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6" />
              Write a Review
            </CardTitle>
            <CardDescription className="text-base">
              Share your thoughts on "{book.title}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              {reviewSubmissionError && (
                <Alert variant="destructive">
                  <AlertDescription>{reviewSubmissionError}</AlertDescription>
                </Alert>
              )}

              {reviewSubmissionSuccess && (
                <Alert className="bg-green-100 text-green-900 border-green-300">
                  <AlertDescription>
                    Review submitted successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Star rating selector */}
              <div>
                <Label
                  htmlFor="rating"
                  className="mb-3 block font-semibold text-base"
                >
                  Your Rating
                </Label>
                <div className="flex justify-center lg:justify-start">
                  {renderStars(newReviewRating, true, setNewReviewRating)}
                </div>
              </div>

              {/* Review text area */}
              <div>
                <Label
                  htmlFor="comment"
                  className="mb-3 block font-semibold text-base"
                >
                  Your Review
                </Label>
                <Textarea
                  id="comment"
                  placeholder="What did you think of this book? Share your experience..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  disabled={!user || reviewSubmissionLoading}
                  rows={6}
                  className="resize-y bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 text-base"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={!user || reviewSubmissionLoading}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {reviewSubmissionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : user ? (
                  "Submit Review"
                ) : (
                  "Login to Review"
                )}
              </Button>

              {!user && (
                <p className="text-center text-gray-600 text-sm">
                  <Button
                    variant="link"
                    onClick={() => router.push("/login")}
                    className="p-0 h-auto text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Button>{" "}
                  to write a review
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Review List */}
        <section>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <MessageSquare className="h-8 w-8" />
            Reviews ({bookReviews.length})
          </h2>

          {bookReviews.length > 0 ? (
            <div className="space-y-6">
              {bookReviews.map((review) => (
                <Card
                  key={review._id}
                  className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="font-bold text-lg text-gray-800">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 text-base">
                            {review.userName}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed text-base">
                      {review.comment}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  No reviews yet
                </h3>
                <p className="text-gray-600 text-lg">
                  Be the first to review this book!
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
