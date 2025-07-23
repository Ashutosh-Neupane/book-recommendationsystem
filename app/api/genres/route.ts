import { type NextRequest, NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { GenreModel } from "@/models/genremodel"

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

    const totalGenres = await GenreModel.countDocuments(query)
    const totalPages = Math.ceil(totalGenres / limit)

    const genres = await GenreModel.find(query).sort({ popularity: -1, totalBooks: -1 }).skip(skip).limit(limit).lean()

    return NextResponse.json({
      genres,
      pagination: {
        currentPage: page,
        totalPages,
        totalGenres,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    })
  } catch (error) {
    console.error("Genres API Error:", error)
    return NextResponse.json({ error: "Failed to fetch genres" }, { status: 500 })
  }
}
