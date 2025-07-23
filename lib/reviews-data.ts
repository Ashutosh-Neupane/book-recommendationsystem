// lib/review-data.ts
import { connectToMongo } from "./mongodb";
import { ReviewModel, IReview } from "@/models/Reviewmodel";
import { Types } from "mongoose";
import { Review } from "@/types"; // Use the consistent type

// Lean result type from Mongo
type LeanReview = Omit<IReview, "_id"> & { _id: Types.ObjectId };

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  try {
    if (typeof window !== "undefined") {
      console.warn("Called getReviewsByBookId on client");
      return [];
    }

    await connectToMongo();
    const reviews = await ReviewModel.find({ bookId })
      .sort({ createdAt: -1 })
      .lean<LeanReview[]>();

    return reviews.map((review) => ({
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    if (typeof window !== "undefined") {
      console.warn("Called getUserReviews on client");
      return [];
    }

    await connectToMongo();
    const reviews = await ReviewModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean<LeanReview[]>();

    return reviews.map((review) => ({
      ...review,
      _id: review._id.toString(),
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
}

export async function submitReviewToDb(
  bookId: string,
  userId: string,
  userName: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string; review?: Review }> {
  try {
    if (typeof window !== "undefined") {
      console.warn("Called submitReviewToDb on client");
      return {
        success: false,
        error: "Cannot submit review from client side directly",
      };
    }

    await connectToMongo();

    const existingReview = await ReviewModel.findOne({ bookId, userId });
    if (existingReview) {
      return { success: false, error: "You have already reviewed this book" };
    }

    const review = new ReviewModel({
      bookId,
      userId,
      userName,
      rating,
      comment,
    });
    const savedReview = await review.save();

    // Return the saved review in the consistent format
    const reviewData: Review = {
      _id: savedReview._id.toString(),
      bookId: savedReview.bookId,
      userId: savedReview.userId,
      userName: savedReview.userName,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt.toISOString(),
      updatedAt: savedReview.updatedAt.toISOString(),
    };

    return { success: true, review: reviewData };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

// Client-side API call function
export async function fetchReviewsFromAPI(token: string): Promise<Review[]> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/reviews/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch reviews: ${res.status}`);
    }

    const data = await res.json();

    // Ensure the data is in the expected format
    if (Array.isArray(data)) {
      return data;
    } else if (data.reviews && Array.isArray(data.reviews)) {
      return data.reviews;
    } else {
      console.warn("Unexpected reviews API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching reviews from API:", error);
    return [];
  }
}

// Fetch reviews for a specific book
export async function fetchReviewsByBookId(bookId: string): Promise<Review[]> {
  try {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/reviews/book/${bookId}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch book reviews: ${res.status}`);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else if (data.reviews && Array.isArray(data.reviews)) {
      return data.reviews;
    } else {
      console.warn("Unexpected book reviews API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching book reviews from API:", error);
    return [];
  }
}
