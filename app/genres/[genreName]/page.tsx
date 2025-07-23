import BookCard from "@/components/book-card"
import { notFound } from "next/navigation"
import { getGenres } from "@/lib/genres-data"

interface GenrePageProps {
  params: {
    genreName: string
  }
}

export default async function GenrePage(props: GenrePageProps) {
  // Get the genreName from the URL directly
  const genreName = props.params.genreName || ""
  // Decode the genre name
  const decodedGenreName = decodeURIComponent(genreName)
  // Fetch genres data
  const genres = await getGenres()

  // Case-insensitive search for genre
  const genre = genres.find((g) => g.name.toLowerCase() === decodedGenreName.toLowerCase())

  if (!genre) {
    // Try to find a partial match if exact match fails
    const partialMatch = genres.find((g) => 
      g.name.toLowerCase().includes(decodedGenreName.toLowerCase()) || 
      decodedGenreName.toLowerCase().includes(g.name.toLowerCase())
    )
    
    if (partialMatch) {
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-blue-400">Genre not found</h1>
            <p className="text-xl mb-8">Did you mean: <span className="text-blue-300">{partialMatch.name}</span>?</p>
            <a href={`/genres/${encodeURIComponent(partialMatch.name)}`} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
              View {partialMatch.name} Books
            </a>
          </div>
        </div>
      )
    }
    
    return notFound()
  }

  // Ensure genre.books exists and is an array before sorting
  const genreBooks = genre.books || []
  const sortedBooks = [...genreBooks].sort((a, b) => b.rating - a.rating)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 text-blue-400">{genre.name}</h1>
        <p className="text-xl text-gray-300 mb-12 font-medium">
          {genre.bookCount} {genre.bookCount === 1 ? "Book" : "Books"} found in this genre.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {sortedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  )
}
