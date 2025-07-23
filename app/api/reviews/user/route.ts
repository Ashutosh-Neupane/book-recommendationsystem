// app/api/reviews/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { ReviewModel } from "@/models/Reviewmodel";

// Helper to extract token from Authorization header
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    console.log("📦 Token received (not verified):", token);

    await connectToMongo();

    const reviews = await ReviewModel.find().sort({ createdAt: -1 }).lean();

    const formattedReviews = reviews.map((review) => ({
      _id: (review._id as any).toString(),
      bookId: review.bookId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt?.toISOString() ?? "",
      updatedAt: review.updatedAt?.toISOString() ?? "",
    }));

    return NextResponse.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error("❌ Reviews GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    console.log("📦 Token received (not verified):", token);

    const body = await request.json();
    const { bookId, rating, comment, userId, userName } = body;

    if (!bookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "BookId and valid rating (1-5) are required" },
        { status: 400 }
      );
    }

    const trimmedComment = comment?.trim();
    if (!trimmedComment) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    if (!userId || !userName) {
      return NextResponse.json(
        { error: "User ID and User Name are required" },
        { status: 400 }
      );
    }

    await connectToMongo();

    const existingReview = await ReviewModel.findOne({ bookId, userId });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this book" },
        { status: 409 }
      );
    }

    const newReview = new ReviewModel({
      bookId,
      userId,
      userName,
      rating: Number(rating),
      comment: trimmedComment,
    });

    const savedReview = await newReview.save();

    const formattedReview = {
      _id: savedReview._id.toString(),
      bookId: savedReview.bookId,
      userId: savedReview.userId,
      userName: savedReview.userName,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt?.toISOString() ?? "",
      updatedAt: savedReview.updatedAt?.toISOString() ?? "",
    };

    return NextResponse.json(
      {
        success: true,
        review: formattedReview,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Review POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    console.log("📦 Token received (not verified):", token);

    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectToMongo();

    const existingReview = await ReviewModel.findById(reviewId);
    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (rating) updateData.rating = Number(rating);
    if (comment !== undefined) updateData.comment = comment.trim();

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    );

    const formattedReview = {
      _id: updatedReview!._id.toString(),
      bookId: updatedReview!.bookId,
      userId: updatedReview!.userId,
      userName: updatedReview!.userName,
      rating: updatedReview!.rating,
      comment: updatedReview!.comment,
      createdAt: updatedReview!.createdAt?.toISOString() ?? "",
      updatedAt: updatedReview!.updatedAt?.toISOString() ?? "",
    };

    return NextResponse.json({
      success: true,
      review: formattedReview,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("❌ Review PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    console.log("📦 Token received (not verified):", token);

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    await connectToMongo();

    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await ReviewModel.findByIdAndDelete(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("❌ Review DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
