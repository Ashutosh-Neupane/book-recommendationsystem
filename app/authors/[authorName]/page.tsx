import BookCard from "@/components/book-card" // Assuming you have your existing BookCard component
import { notFound } from "next/navigation"
import AuthorImage from "@/components/AuthorImage"
import { getAuthors } from "@/lib/authors-data" // Import the async getAuthors function

// Define the component props based on the dynamic route segment
interface AuthorPageProps {
  params: {
    authorName: string
  }
}

export default async function AuthorPage(props: AuthorPageProps) {
  // Get the authorName from the URL directly
  const authorName = props.params.authorName || ""
  // Decode the author name
  const decodedAuthorName = decodeURIComponent(authorName)
  
  // Fetch all authors
  const authors = await getAuthors() // Await the authors data

  // Find the author in our dataset - case insensitive search
  const author = authors.find((a) => a.name.toLowerCase() === decodedAuthorName.toLowerCase())

  // Handle the case where the author is not found
  if (!author) {
    // Try to find a partial match if exact match fails
    const partialMatch = authors.find((a) => 
      a.name.toLowerCase().includes(decodedAuthorName.toLowerCase()) || 
      decodedAuthorName.toLowerCase().includes(a.name.toLowerCase())
    )
    
    if (partialMatch) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-blue-400">Author not found</h1>
            <p className="text-xl mb-8">Did you mean: <span className="text-blue-300">{partialMatch.name}</span>?</p>
            <a href={`/authors/${encodeURIComponent(partialMatch.name)}`} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
              View {partialMatch.name}'s Page
            </a>
          </div>
        </div>
      )
    }
    
    return notFound()
  }

  // Ensure author.books exists and is an array before sorting
  const authorBooks = author.books || []
  // Sort books by published year (optional)
  const sortedBooks = [...authorBooks].sort((a, b) => b.publishedYear - a.publishedYear)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Author Header Section (TMDB-style) */}
      <div className="relative py-20 px-8 bg-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
          {/* Author Image */}

          <div className="flex-shrink-0 w-48 h-48 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            <AuthorImage authorName={author.name} size={256} />
          </div>

          {/* Author Info */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-extrabold text-blue-400 mb-4">{author.name}</h1>
            <p className="text-xl text-gray-300 font-medium mb-6">
              {author.bookCount} Published {author.bookCount === 1 ? "Book" : "Books"}
            </p>
            <p className="text-gray-400 leading-relaxed max-w-2xl">{author.bio}</p>
          </div>
        </div>
      </div>

      {/* Author's Books Section */}
      <div className="max-w-7xl mx-auto py-16 px-8">
        <h2 className="text-3xl font-bold mb-10 text-gray-100 border-b-4 border-blue-500 pb-3 inline-block">
          Books by {author.name}
        </h2>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedBooks.map((book) => (
            // Assuming your BookCard component works correctly
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  )
}
