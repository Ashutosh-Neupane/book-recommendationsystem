import { type NextRequest, NextResponse } from "next/server"
import { connectToMongo } from "@/lib/mongodb"
import { BookModel } from "@/models/bookmodel"

export async function GET(request: NextRequest) {
  try {
    await connectToMongo()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const search = searchParams.get("search") || ""
    const genre = searchParams.get("genre") || ""
    const author = searchParams.get("author") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const batch = Number.parseInt(searchParams.get("batch") || "1")

    // Calculate skip based on batch system
    // Each batch loads 1000 books, then paginate within that batch
    const booksPerBatch = 1000
    const batchOffset = (batch - 1) * booksPerBatch
    const skip = batchOffset + (page - 1) * limit

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
      ]
    }

    if (genre) {
      query.genres = { $regex: genre, $options: "i" }
    }

    if (author) {
      query.author = { $regex: author, $options: "i" }
    }

    // Get total count for current batch
    const totalBooks = await BookModel.countDocuments(query)
    const batchTotal = Math.min(booksPerBatch, totalBooks - batchOffset)
    const totalPages = Math.ceil(batchTotal / limit)

    // Build sort object
    const sortObj: any = {}
    if (sortBy === 'title') {
      sortObj.title = sortOrder === "desc" ? -1 : 1
    } else if (sortBy === 'author') {
      sortObj.author = sortOrder === "desc" ? -1 : 1
    } else if (sortBy === 'rating') {
      sortObj.rating = sortOrder === "desc" ? -1 : 1
    } else {
      // Default to createdAt or _id if not available
      sortObj._id = sortOrder === "desc" ? -1 : 1
    }

    // Fetch books with pagination
    const rawBooks = await BookModel.find(query).sort(sortObj).skip(skip).limit(limit).lean()
    
    // Transform the books to ensure consistent format
    const books = rawBooks.map((book: any) => {
      // Parse genre data
      let parsedGenre: string[] = []
      const rawCategory = book.Category
      
      if (rawCategory) {
        if (Array.isArray(rawCategory)) {
          parsedGenre = rawCategory.filter((item) => typeof item === "string")
        } else if (typeof rawCategory === "string") {
          try {
            if (rawCategory.includes(',')) {
              parsedGenre = rawCategory.split(',').map(g => g.trim()).filter(Boolean)
            } else {
              parsedGenre = [rawCategory]
            }
          } catch (e) {
            parsedGenre = [rawCategory]
          }
        }
      }
      
      // Ensure we have at least one genre
      if (parsedGenre.length === 0) {
        parsedGenre = ["General"]
      }
      
      // Ensure we have valid data for each field
      const bookTitle = book.book_title || book.title || "Untitled"
      const bookAuthor = book.book_author || book.author || "Unknown Author"
      
      return {
        id: book._id.toString(),
        title: String(bookTitle),
        author: String(bookAuthor),
        description: String(book.Summary || book.description || "No description available."),
        coverImage: String(book.img_l || book.coverImage || "/placeholder.svg"),
        rating: book.rating || Math.round((Math.random() * 4 + 1) * 10) / 10,
        publishedYear: book.year_of_publication || book.publishedYear || 2000,
        genre: parsedGenre,
        isbn: String(book.isbn?.toString() || "N/A"),
        pages: book.pages || Math.floor(Math.random() * 800) + 100,
        language: String(book.Language || book.language || "English"),
      }
    })

    // Check if we need to load next batch
    const currentBatchPage = page - Math.floor(batchOffset / limit)
    const shouldLoadNextBatch = currentBatchPage >= 35 && batch * booksPerBatch < totalBooks

    return NextResponse.json({
      books,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: batchTotal,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        batch,
        shouldLoadNextBatch,
        maxPagesInBatch: 50, // Don't show option to go beyond page 50 in current batch
      },
    })
  } catch (error) {
    console.error("Books API Error:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}
