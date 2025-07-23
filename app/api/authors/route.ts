import { type NextRequest, NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { AuthorModel } from "@/models/authormodel"

export async function GET(request: NextRequest) {
  try {
    await connectToMongo()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const query: any = {}
    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const totalAuthors = await AuthorModel.countDocuments(query)
    const totalPages = Math.ceil(totalAuthors / limit)

    const authors = await AuthorModel.find(query)
      .sort({ averageRating: -1, totalBooks: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    return NextResponse.json({
      authors,
      pagination: {
        currentPage: page,
        totalPages,
        totalAuthors,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    })
  } catch (error) {
    console.error("Authors API Error:", error)
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 })
  }
}
