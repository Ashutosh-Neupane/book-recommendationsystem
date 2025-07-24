import { type NextRequest, NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { BookModel } from "@/models/bookmodel";
import { AuthorModel } from "@/models/authormodel";
import { GenreModel } from "@/models/genremodel";

export async function GET(request: NextRequest) {
  try {
    await connectToMongo();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );
    const skip = (page - 1) * limit;
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return NextResponse.json({
        results: { books: [], authors: [], genres: [] },
        total: 0,
        totalPages: 1,
      });
    }

    const searchRegex = { $regex: normalizedQuery, $options: "i" };
    const results: Record<string, any[]> = {};
    let total = 0;

    if (type === "all" || type === "books") {
      const [books, count] = await Promise.all([
        BookModel.find({
          $or: [
            { title: searchRegex },
            { author: searchRegex },
            { description: searchRegex },
          ],
        })
          .skip(skip)
          .limit(limit)
          .select("title author genre rating image")
          .lean(),
        BookModel.countDocuments({
          $or: [
            { title: searchRegex },
            { author: searchRegex },
            { description: searchRegex },
          ],
        }),
      ]);
      results.books = books;
      total = count;
    }

    if (type === "all" || type === "authors") {
      results.authors = await AuthorModel.find({ name: searchRegex })
        .limit(limit)
        .select("name bio totalBooks averageRating image")
        .lean();
    }

    if (type === "all" || type === "genres") {
      results.genres = await GenreModel.find({ name: searchRegex })
        .limit(limit)
        .select("name description totalBooks averageRating")
        .lean();
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      results: {
        books: results.books || [],
        authors: results.authors || [],
        genres: results.genres || [],
      },
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
