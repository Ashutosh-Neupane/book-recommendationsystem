import { BookModel } from "@/models/bookmodel";
import { connectToMongo } from "./mongodb";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  rating: number;
  publishedYear: number;
  genre: string[];
  isbn: string;
  pages: number;
  language: string;
  reviewCount?: number;
  image?: string;
  year?: number;
  summary?: string;
  img_l?: string;
  genres?: string | string[];
  _id?: string;
}

export const fetchBooksFromMongo = async (
  limit: number = 200
): Promise<Book[]> => {
  // Only run on server-side
  if (typeof window !== "undefined") {
    throw new Error(
      "fetchBooksFromMongo should only be called on the server side"
    );
  }

  try {
    await connectToMongo();

    // Use projection to only fetch the fields we need
    const rawBooks = (await BookModel.find()
      .select(
        "_id title author summary img_l rating year genres isbn pages language"
      )
      .limit(limit) // Configurable limit
      .lean()) as Array<{
      _id: string;
      title?: string;
      author?: string;
      summary?: string;
      img_l?: string;
      rating?: number;
      year?: number;
      genres?: string | string[];
      isbn?: string;
      pages?: number;
      language?: string;
    }>;

    if (!rawBooks || !Array.isArray(rawBooks)) {
      console.warn(
        "BookModel.find() did not return a valid array. Returning empty array."
      );
      return [];
    }

    return rawBooks.map((book) => {
      let parsedGenre: string[] = [];
      const rawGenres = book.genres;

      if (rawGenres) {
        if (Array.isArray(rawGenres)) {
          parsedGenre = rawGenres.filter((item) => typeof item === "string");
        } else if (typeof rawGenres === "string") {
          try {
            // First try to parse as JSON
            try {
              const jsonString = rawGenres.replace(/'/g, '"');
              const jsonParsed = JSON.parse(jsonString);
              if (Array.isArray(jsonParsed)) {
                parsedGenre = jsonParsed.filter(
                  (item) => typeof item === "string"
                );
              } else if (typeof jsonParsed === "string") {
                parsedGenre = [jsonParsed];
              } else {
                parsedGenre = [];
              }
            } catch {
              // If JSON parsing fails, try comma-separated values
              if (rawGenres.includes(",")) {
                parsedGenre = rawGenres
                  .split(",")
                  .map((g) => g.trim())
                  .filter(Boolean);
              } else {
                parsedGenre = [rawGenres];
              }
            }
          } catch (e) {
            console.error(
              `Error parsing genre for book '${book.title || book._id}':`,
              e
            );
            parsedGenre = [rawGenres];
          }
        }
      }

      // Ensure we have at least one genre
      if (parsedGenre.length === 0) {
        parsedGenre = ["General"];
      }

      return {
        id: book._id.toString(),
        _id: book._id.toString(),
        title: String(book.title || "Untitled"),
        author: String(book.author || "Unknown Author"),
        description: String(book.summary || "No description available."),
        summary: String(book.summary || "No description available."),
        coverImage: String(book.img_l || "/placeholder.svg"),
        image: String(book.img_l || "/placeholder.svg"),
        img_l: String(book.img_l || "/placeholder.svg"),
        rating: book.rating || Math.round((Math.random() * 4 + 1) * 10) / 10,
        publishedYear: book.year || 2000,
        year: book.year || 2000,
        genre: parsedGenre,
        genres: parsedGenre,
        isbn: String(book.isbn?.toString() || "N/A"),
        pages: book.pages || Math.floor(Math.random() * 800) + 100,
        language: String(book.language || "English"),
        reviewCount: Math.floor(Math.random() * 1000) + 10, // Add mock review count
      };
    });
  } catch (error) {
    console.error("Error in fetchBooksFromMongo:", error);
    return [];
  }
};

// Function to fetch a limited set of books for the home page
export const fetchHomePageBooks = async (): Promise<Book[]> => {
  // Only run on server-side
  if (typeof window !== "undefined") {
    throw new Error(
      "fetchHomePageBooks should only be called on the server side"
    );
  }

  try {
    await connectToMongo();

    // Use projection to only fetch the fields we need for the home page
    // Fetch only top-rated books for faster loading
    const rawBooks = await BookModel.find()
      .select(
        "_id title author summary img_l rating genres year pages isbn language"
      )
      .sort({ rating: -1 }) // Sort by rating descending
      .limit(50) // Very limited for home page
      .lean();

    if (!rawBooks || !Array.isArray(rawBooks)) {
      console.warn(
        "BookModel.find() did not return a valid array. Returning empty array."
      );
      return [];
    }

    return rawBooks.map((book: any) => {
      let parsedGenre: string[] = [];
      const rawGenres = book.genres;

      if (rawGenres) {
        if (Array.isArray(rawGenres)) {
          parsedGenre = rawGenres.filter((item) => typeof item === "string");
        } else if (typeof rawGenres === "string") {
          try {
            if (rawGenres.includes(",")) {
              parsedGenre = rawGenres
                .split(",")
                .map((g) => g.trim())
                .filter(Boolean);
            } else {
              parsedGenre = [rawGenres];
            }
          } catch (e) {
            parsedGenre = [rawGenres];
          }
        }
      }

      if (parsedGenre.length === 0) {
        parsedGenre = ["General"];
      }

      return {
        id: book._id.toString(),
        _id: book._id.toString(),
        title: String(book.title || "Untitled"),
        author: String(book.author || "Unknown Author"),
        description: String(book.summary || "No description available."),
        summary: String(book.summary || "No description available."),
        coverImage: String(book.img_l || "/placeholder.svg"),
        image: String(book.img_l || "/placeholder.svg"),
        img_l: String(book.img_l || "/placeholder.svg"),
        rating: book.rating || 4.5,
        publishedYear: book.year || 2000,
        year: book.year || 2000,
        genre: parsedGenre,
        genres: parsedGenre,
        isbn: String(book.isbn?.toString() || "N/A"),
        pages: book.pages || 300,
        language: String(book.language || "English"),
        reviewCount: Math.floor(Math.random() * 500) + 50, // Add mock review count
      };
    });
  } catch (error) {
    console.error("Error in fetchHomePageBooks:", error);
    return [];
  }
};

// Function to fetch a single book by ID directly from MongoDB
export const fetchBookById = async (bookId: string): Promise<Book | null> => {
  // Only run on server-side
  if (typeof window !== "undefined") {
    throw new Error("fetchBookById should only be called on the server side");
  }

  try {
    await connectToMongo();

    const book = (await BookModel.findById(bookId)
      .select(
        "_id title author summary img_l rating year genres isbn pages language"
      )
      .lean()) as {
      _id: string;
      title?: string;
      author?: string;
      summary?: string;
      img_l?: string;
      rating?: number;
      year?: number;
      genres?: string | string[];
      isbn?: string;
      pages?: number;
      language?: string;
    } | null;

    if (!book) {
      console.warn(`Book with ID ${bookId} not found in database`);
      return null;
    }

    let parsedGenre: string[] = [];
    const rawGenres = book.genres;

    if (rawGenres) {
      if (Array.isArray(rawGenres)) {
        parsedGenre = rawGenres.filter((item) => typeof item === "string");
      } else if (typeof rawGenres === "string") {
        try {
          if (rawGenres.includes(",")) {
            parsedGenre = rawGenres
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean);
          } else {
            parsedGenre = [rawGenres];
          }
        } catch (e) {
          parsedGenre = [rawGenres];
        }
      }
    }

    if (parsedGenre.length === 0) {
      parsedGenre = ["General"];
    }

    return {
      id: book._id.toString(),
      _id: book._id.toString(),
      title: String(book.title || "Untitled"),
      author: String(book.author || "Unknown Author"),
      description: String(book.summary || "No description available."),
      summary: String(book.summary || "No description available."),
      coverImage: String(book.img_l || "/placeholder.svg"),
      image: String(book.img_l || "/placeholder.svg"),
      img_l: String(book.img_l || "/placeholder.svg"),
      rating: book.rating || 4.5,
      publishedYear: book.year || 2000,
      year: book.year || 2000,
      genre: parsedGenre,
      genres: parsedGenre,
      isbn: String(book.isbn?.toString() || "N/A"),
      pages: book.pages || 300,
      language: String(book.language || "English"),
      reviewCount: Math.floor(Math.random() * 300) + 25, // Add mock review count
    };
  } catch (error) {
    console.error(`Error fetching book with ID ${bookId}:`, error);
    return null;
  }
};

// Client-side function to fetch books via API
export const fetchBooksFromAPI = async (): Promise<Book[]> => {
  try {
    // Use absolute URL with origin for server components
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
    const response = await fetch(`${baseUrl}/api/books`);
    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.status}`);
    }
    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error("Error fetching books from API:", error);
    return [];
  }
};

// Client-side function to fetch a single book by ID via API
export const fetchBookByIdFromAPI = async (
  bookId: string
): Promise<Book | null> => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000");
    const response = await fetch(`${baseUrl}/api/books/${bookId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch book: ${response.status}`);
    }

    const data = await response.json();
    return data.book || null;
  } catch (error) {
    console.error(`Error fetching book with ID ${bookId}:`, error);
    return null;
  }
};
