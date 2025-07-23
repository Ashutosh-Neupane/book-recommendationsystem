import { fetchBooksFromMongo, type Book } from "@/lib/books-data";

export interface Genre {
  name: string;
  bookCount: number;
  books: Book[];
}

export const getGenres = async (): Promise<Genre[]> => {
  if (typeof window !== "undefined") {
    throw new Error("getGenres should only be called on the server side");
  }

  // Limit to 100 books for genre data to improve performance
  const books = await fetchBooksFromMongo(100);

  if (!Array.isArray(books)) {
    console.error(
      "getGenres received non-array 'books' from fetchBooksFromMongo."
    );
    return [];
  }

  const genreMap = new Map<string, Book[]>();

  books.forEach((book: Book) => {
    let genres: string[] = [];

    genres = Array.isArray(book.genre) ? book.genre : [];

    genres = [...new Set(genres)];

    genres.forEach((genreName) => {
      const normalized = genreName.toLowerCase(); // normalize to lowercase to avoid duplicates
      if (!genreMap.has(normalized)) {
        genreMap.set(normalized, []);
      }
      genreMap.get(normalized)!.push(book);
    });
  });

  const genres: Genre[] = Array.from(genreMap.entries()).map(
    ([normalizedName, booksInGenre]) => {
      // Optionally capitalize first letter or keep normalized name as is
      const displayName =
        normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
      return {
        name: displayName,
        bookCount: booksInGenre.length,
        books: booksInGenre,
      };
    }
  );

  return genres.sort((a, b) => b.bookCount - a.bookCount);
};

// Client-side API fetcher remains same
export const fetchGenresFromAPI = async (): Promise<Genre[]> => {
  try {
    const response = await fetch("/api/genres");
    if (!response.ok) {
      throw new Error(`Failed to fetch genres: ${response.status}`);
    }
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres from API:", error);
    return [];
  }
};
