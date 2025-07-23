import { NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { BookModel } from "@/models/bookmodel"

export async function GET() {
  try {
    await connectToMongo()

    const topRatedBooks = await BookModel.find({
      rating: { $gte: 4.0 },
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(10) // Limit to exactly 10 highest rated books
      .lean()

    return NextResponse.json({ books: topRatedBooks })
  } catch (error) {
    console.error("Top Rated Books API Error:", error)
    return NextResponse.json({ error: "Failed to fetch top rated books" }, { status: 500 })
  }
}
