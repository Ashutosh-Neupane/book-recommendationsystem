import { type NextRequest, NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { BookModel } from "@/models/bookmodel"
import { AuthorModel } from "@/models/authormodel"
import { GenreModel } from "@/models/genremodel"

export async function GET(request: NextRequest) {
  try {
    await connectToMongo()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    const searchRegex = { $regex: query, $options: "i" }
    const results: any = {}

    if (type === "all" || type === "books") {
      const books = await BookModel.find({
        $or: [{ title: searchRegex }, { author: searchRegex }, { description: searchRegex }],
      })
        .limit(limit)
        .select("title author genre rating image")
        .lean()

      results.books = books
    }

    if (type === "all" || type === "authors") {
      const authors = await AuthorModel.find({
        name: searchRegex,
      })
        .limit(limit)
        .select("name bio totalBooks averageRating image")
        .lean()

      results.authors = authors
    }

    if (type === "all" || type === "genres") {
      const genres = await GenreModel.find({
        name: searchRegex,
      })
        .limit(limit)
        .select("name description totalBooks averageRating")
        .lean()

      results.genres = genres
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search API Error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
