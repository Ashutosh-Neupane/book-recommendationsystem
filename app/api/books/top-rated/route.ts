import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import { BookModel } from "@/models/bookmodel";
import { ReviewModel } from "@/models/Reviewmodel";

export async function GET() {
  try {
    await connectToMongo();

    const topRatedBooks = await ReviewModel.aggregate([
      {
        $group: {
          _id: "$bookId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $match: {
          averageRating: { $gte: 4.0 },
          reviewCount: { $gte: 1 },
        },
      },
      {
        $sort: { averageRating: -1, reviewCount: -1 },
      },
      {
        $limit: 20, // Get more books in case some don't have images
      },
      {
        $addFields: {
          convertedBookId: {
            $cond: {
              if: { $eq: [{ $type: "$_id" }, "objectId"] },
              then: "$_id",
              else: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: [{ $type: "$_id" }, "string"] },
                      {
                        $regexMatch: {
                          input: "$_id",
                          regex: /^[0-9a-fA-F]{24}$/,
                        },
                      },
                    ],
                  },
                  then: { $toObjectId: "$_id" },
                  else: "$_id",
                },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "convertedBookId",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $match: {
          "bookDetails.0": { $exists: true },
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          id: { $toString: "$bookDetails._id" },
          _id: "$bookDetails._id",
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          isbn: "$bookDetails.isbn",

          // ✅ FIXED: Use correct field names from your schema
          description: "$bookDetails.summary",
          publishedYear: "$bookDetails.year", // year -> publishedYear for frontend compatibility
          genre: "$bookDetails.genres", // genres -> genre for frontend compatibility
          language: "$bookDetails.language",
          publisher: "$bookDetails.publisher",

          // ✅ FIXED: Use your actual image fields (prefer larger images)
          coverImage: {
            $ifNull: [
              "$bookDetails.img_l", // Large image first
              {
                $ifNull: [
                  "$bookDetails.img_m", // Medium image as fallback
                  "$bookDetails.img_s", // Small image as last resort
                ],
              },
            ],
          },

          // Include all image sizes for flexibility
          images: {
            small: "$bookDetails.img_s",
            medium: "$bookDetails.img_m",
            large: "$bookDetails.img_l",
          },

          rating: { $round: ["$averageRating", 1] },
          reviewCount: "$reviewCount",

          // Add pages field (you might not have this, so make it optional)
          pages: { $ifNull: ["$bookDetails.pages", null] },
        },
      },
      {
        // Only include books that have at least one image and a summary
        $match: {
          $and: [
            {
              $or: [
                { coverImage: { $ne: null } },
                { "images.small": { $ne: null } },
                { "images.medium": { $ne: null } },
                { "images.large": { $ne: null } },
              ],
            },
            { description: { $ne: null } },
            { description: { $ne: "" } },
          ],
        },
      },
      {
        $limit: 12, // Final limit after filtering
      },
    ]);

    console.log(
      `Found ${topRatedBooks.length} top-rated books with images and descriptions`
    );

    // Log first book for verification
    if (topRatedBooks.length > 0) {
      const firstBook = topRatedBooks[0];
      console.log("Sample book:", {
        title: firstBook.title,
        author: firstBook.author,
        hasDescription: !!firstBook.description,
        hasCoverImage: !!firstBook.coverImage,
        coverImageUrl: firstBook.coverImage,
        descriptionLength: firstBook.description?.length || 0,
        rating: firstBook.rating,
      });
    }

    return NextResponse.json({
      books: topRatedBooks,
      total: topRatedBooks.length,
    });
  } catch (error) {
    console.error("Top Rated Books API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch top rated books", details: error },
      { status: 500 }
    );
  }
}
