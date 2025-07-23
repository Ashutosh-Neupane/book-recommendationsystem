import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToMongo } from "@/lib/mongodb"
import { ReviewModel } from "@/models/Reviewmodel"
import { UserModel } from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")

    await connectToMongo()
    
    // If bookId is provided, filter by bookId, otherwise get all reviews
    const query = bookId ? { bookId } : {}
    const reviews = await ReviewModel.find(query).sort({ createdAt: -1 }).lean()

    const formattedReviews = reviews.map((review) => ({
      id: review._id.toString(),
      bookId: review.bookId,
      userId: review.userId,
      username: review.userName, // Map userName to username for client-side consistency
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString()
    }))

    return NextResponse.json({ reviews: formattedReviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
    const { bookId, userId, username, rating, comment } = await request.json()

    if (!bookId || !rating || !comment) {
      return NextResponse.json({ error: "Book ID, rating, and comment are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    await connectToMongo()

    // Check if user already reviewed this book
    const existingReview = await ReviewModel.findOne({ bookId, userId: decoded.id })
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this book" }, { status: 400 })
    }

    // Get user name
    const user = await UserModel.findById(decoded.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const review = new ReviewModel({
      bookId,
      userId: decoded.id,
      userName: username || user.name, // Use provided username or fall back to user.name
      rating,
      comment,
    })

    await review.save()

    return NextResponse.json({
      message: "Review submitted successfully",
      review: {
        id: review._id.toString(),
        bookId: review.bookId,
        userId: review.userId,
        username: review.userName, // Map userName to username for client-side consistency
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt.toISOString()
      },
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
