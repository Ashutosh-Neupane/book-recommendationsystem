"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  BookOpen,
  Star,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getToken, getCurrentUser } from "@/lib/auth";
import { fetchBooksFromAPI, Book } from "@/lib/books-data";
import { fetchReviewsFromAPI } from "@/lib/reviews-data";
import { useWishlist } from "@/context/WishlistContext";
import { User as UserType } from "@/types";

// Updated Review interface to match your API
interface Review {
  _id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

function StatCard({ title, value, icon, onClick, isActive }: StatCardProps) {
  return (
    <div
      className={`flex flex-col p-6 rounded-lg shadow-md border transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-blue-50 border-blue-300 shadow-lg"
          : "bg-white border-gray-200 hover:shadow-lg hover:border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className={`mr-3 ${isActive ? "text-blue-700" : "text-blue-600"}`}>
          {icon}
        </div>
        <h3
          className={`text-lg font-semibold ${
            isActive ? "text-blue-900" : "text-gray-800"
          }`}
        >
          {title}
        </h3>
      </div>
      <p
        className={`text-3xl font-bold ${
          isActive ? "text-blue-900" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ReviewCard({
  review,
  book,
}: {
  review: Review;
  book: Book | undefined;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start space-x-4">
        <img
          src={
            book?.coverImage || book?.image || book?.img_l || "/placeholder.svg"
          }
          alt={book?.title || "Book cover"}
          className="w-16 h-20 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-1">
            {book?.title || "Unknown Book"}
          </h4>
          <p className="text-gray-600 text-sm mb-2">
            by {book?.author || "Unknown Author"}
          </p>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {review.rating}/5
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {review.comment}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function WishlistCard({ book }: { book: Book }) {
  const { toggleWishlistStatus } = useWishlist();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      await toggleWishlistStatus(book.id || book._id || "");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start space-x-4">
        <img
          src={
            book.coverImage || book.image || book.img_l || "/placeholder.svg"
          }
          alt={book.title}
          className="w-16 h-20 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-gray-900 mb-1">
            {book.title}
          </h4>
          <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(book.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">{book.rating}/5</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {book.description || book.summary || "No description available."}
          </p>
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {isRemoving ? "Removing..." : "Remove from Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { wishlistItems, isLoading: wishlistLoading } = useWishlist();

  const [user, setUser] = useState<UserType | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userReviewedBookIds, setUserReviewedBookIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "reviews" | "wishlist">(
    "stats"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        const token = getToken();
        if (!token) {
          console.error("No token found");
          return;
        }

        // Fetch books first
        const booksData = await fetchBooksFromAPI();
        setBooks(booksData);

        // Try to fetch reviews, but don't fail if it errors
        try {
          const reviewsData = await fetchReviewsFromAPI(token);
          const userReviewsFiltered = reviewsData.filter(
            (review: Review) => review.userId === currentUser.id
          );
          setUserReviews(userReviewsFiltered);

          const reviewedBookIds = new Set<string>(
            userReviewsFiltered.map((review: Review) => review.bookId)
          );
          setUserReviewedBookIds(reviewedBookIds);
        } catch (reviewError) {
          console.error("Error fetching reviews:", reviewError);
          // Continue without reviews for now
          setUserReviews([]);
          setUserReviewedBookIds(new Set());
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading || wishlistLoading) {
    return <LoadingSpinner />;
  }

  // Calculate average rating
  const avgRating =
    userReviews.length > 0
      ? (
          userReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          userReviews.length
        ).toFixed(2)
      : "0.00";

  // Calculate reviews this month
  const reviewsThisMonth = userReviews.filter((review) => {
    const date = new Date(review.createdAt);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  // Get wishlist books
  const wishlistBooks = books.filter((book) =>
    wishlistItems.includes(book.id || book._id || "")
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <span>📊</span>
            Dashboard
          </h1>
          {user && (
            <p className="text-gray-600 mt-2">Welcome back, {user.name}!</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Books Read"
            value={userReviewedBookIds.size}
            icon={<BookOpen size={24} />}
            onClick={() => setActiveTab("reviews")}
            isActive={activeTab === "reviews"}
          />
          <StatCard
            title="In Wishlist"
            value={wishlistItems.length}
            icon={<Heart size={24} />}
            onClick={() => setActiveTab("wishlist")}
            isActive={activeTab === "wishlist"}
          />
          <StatCard
            title="Avg Rating"
            value={avgRating}
            icon={<Star size={24} />}
            onClick={() => setActiveTab("stats")}
            isActive={activeTab === "stats"}
          />
          <StatCard
            title="This Month"
            value={reviewsThisMonth}
            icon={<Calendar size={24} />}
            onClick={() => setActiveTab("stats")}
            isActive={activeTab === "stats"}
          />
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("stats")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "stats"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Statistics
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Reviews ({userReviews.length})
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "wishlist"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Wishlist ({wishlistItems.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "stats" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reading Statistics
                </h2>

                {userReviews.length === 0 && wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Start Your Reading Journey
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Begin by adding books to your wishlist or writing your
                      first review.
                    </p>
                    <button
                      onClick={() => router.push("/books")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Browse Books
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Reading Activity
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Total Books Read:
                          </span>
                          <span className="font-semibold">
                            {userReviewedBookIds.size}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Books in Wishlist:
                          </span>
                          <span className="font-semibold">
                            {wishlistItems.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Average Rating:</span>
                          <span className="font-semibold">{avgRating} ⭐</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Reviews This Month:
                          </span>
                          <span className="font-semibold">
                            {reviewsThisMonth}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => router.push("/books")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Browse Books
                        </button>
                        <button
                          onClick={() => setActiveTab("wishlist")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          View Wishlist
                        </button>
                        <button
                          onClick={() => setActiveTab("reviews")}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          My Reviews
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  My Reviews
                </h2>
                {userReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start reading and share your thoughts about books!
                    </p>
                    <button
                      onClick={() => router.push("/books")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Find Books to Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map((review) => {
                      const book = books.find(
                        (b) => (b.id || b._id) === review.bookId
                      );
                      return (
                        <ReviewCard
                          key={review._id}
                          review={review}
                          book={book}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  My Wishlist
                </h2>
                {wishlistBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Your wishlist is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add some books you'd like to read to your wishlist!
                    </p>
                    <button
                      onClick={() => router.push("/books")}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Browse Books
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistBooks.map((book) => (
                      <WishlistCard key={book.id || book._id} book={book} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
