// books.ts (new file)
import { BookModel } from "@/models/bookmodel"; // Assuming correct path to your Mongoose model
import { connectToMongo } from "./mongodb"; // Assuming correct path to your MongoDB connection utility

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
}

export const fetchBooksFromMongo = async (): Promise<Book[]> => {
  await connectToMongo();

  const rawBooks = await BookModel.find().lean();

  return rawBooks.map((book: any) => ({
    id: book._id.toString(),
    title: book.book_title || "Untitled",
    author: book.book_author || "Unknown Author",
    description: book.Summary || "No description available.",
    coverImage: book.img_l || "/placeholder.svg",
    rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // fake for now
    publishedYear: book.year_of_publication || 2000,
    genre: JSON.parse(book.Category || "[]"),
    isbn: book.isbn?.toString() || "N/A",
    pages: Math.floor(Math.random() * 800) + 100,
    language: book.Language || "English",
  }));
};

// You no longer need `export const books = generateBooks()` from the old file.
// Instead, other files will *await* `fetchBooksFromMongo()`
