import BookCard from "@/components/book-card"; // Assuming you have your existing BookCard component
import { notFound } from "next/navigation";
import AuthorImage from "@/components/AuthorImage";
import { getAuthors } from "@/lib/authors-data"; // Import the async getAuthors function

interface AuthorPageProps {
  params: {
    authorName: string;
  };
}

export default async function AuthorPage(props: AuthorPageProps) {
  const authorName = props.params.authorName || "";
  const decodedAuthorName = decodeURIComponent(authorName);

  const authors = await getAuthors();

  const author = authors.find(
    (a) => a.name.toLowerCase() === decodedAuthorName.toLowerCase()
  );

  if (!author) {
    const partialMatch = authors.find(
      (a) =>
        a.name.toLowerCase().includes(decodedAuthorName.toLowerCase()) ||
        decodedAuthorName.toLowerCase().includes(a.name.toLowerCase())
    );

    if (partialMatch) {
      return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900 p-8 flex items-center justify-center">
          <div className="max-w-3xl text-center bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-xl">
            <h1 className="text-4xl font-extrabold mb-6">Author Not Found</h1>
            <p className="text-xl mb-8">
              Did you mean:{" "}
              <span className="font-semibold text-purple-600">
                {partialMatch.name}
              </span>
              ?
            </p>
            <a
              href={`/authors/${encodeURIComponent(partialMatch.name)}`}
              className="inline-block bg-purple-600 hover:bg-purple-700 transition-colors px-8 py-3 rounded-full font-medium shadow-lg text-white"
            >
              View {partialMatch.name}'s Page
            </a>
          </div>
        </div>
      );
    }

    return notFound();
  }

  const authorBooks = author.books || [];
  const sortedBooks = [...authorBooks].sort(
    (a, b) => b.publishedYear - a.publishedYear
  );

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900">
      {/* Author Header Section */}
      <div className="relative py-20 px-8 bg-white/90 backdrop-blur-lg shadow-lg rounded-xl max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-10 md:space-y-0 md:space-x-16">
          {/* Author Image */}
          <div className="flex-shrink-0 w-56 h-56 rounded-full overflow-hidden border-8 border-purple-300 shadow-lg">
            <AuthorImage authorName={author.name} size={256} />
          </div>

          {/* Author Info */}
          <div className="text-center md:text-left max-w-3xl">
            <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
              {author.name}
            </h1>
            <p className="text-2xl text-purple-700 font-semibold mb-6">
              {author.bookCount} Published{" "}
              {author.bookCount === 1 ? "Book" : "Books"}
            </p>
            <p className="text-gray-700 leading-relaxed text-lg max-w-2xl">
              {author.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Author's Books Section */}
      <div className="max-w-7xl mx-auto py-16 px-8">
        <h2 className="text-4xl font-extrabold mb-12 bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent border-b-4 border-purple-300 pb-4 inline-block">
          Books by {author.name}
        </h2>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {sortedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
