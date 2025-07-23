import BooksClient from "@/components/BooksClient";
import HeroSection from "@/components/hero-section";
import { getGenres } from "@/lib/genres-data";
import { fetchHomePageBooks } from "@/lib/books-data";
import { getServerUser } from "@/lib/server-auth";

export default async function HomePage() {
  try {
    const [genres, books, serverUser] = await Promise.all([
      getGenres(),
      fetchHomePageBooks(),
      getServerUser(),
    ]);

    const user = serverUser
      ? { name: serverUser.name, email: serverUser.email }
      : null;

    return (
      <div className="min-h-screen">
        {user && <HeroSection userName={user.name} />}

        <div className={user ? "pt-8" : ""}>
          <BooksClient
            initialBooks={books}
            genres={genres.map((g) => g.name)} // ✅ convert to string[]
            user={user}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading home page:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">
          Failed to load books. Please try again later.
        </p>
      </div>
    );
  }
}
