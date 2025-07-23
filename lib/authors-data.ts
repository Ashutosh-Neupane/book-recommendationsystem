import { fetchBooksFromMongo, type Book } from "@/lib/books-data"

export interface Author {
  name: string
  bio: string
  image: string
  bookCount: number
  books: Book[]
}

export const getAuthors = async (): Promise<Author[]> => {
  // Only run on server-side
  if (typeof window !== "undefined") {
    throw new Error("getAuthors should only be called on the server side")
  }

  // Limit to 100 books for author data to improve performance
  const books = await fetchBooksFromMongo(100)

  const authorMap = new Map<string, { books: Book[]; count: number }>()

  books.forEach((book) => {
    const authorName = book.author
    if (!authorMap.has(authorName)) {
      authorMap.set(authorName, { books: [], count: 0 })
    }
    const authorData = authorMap.get(authorName)
    authorData?.books.push(book)
    authorData!.count += 1
  })

  const authors: Author[] = Array.from(authorMap.keys()).map((authorName) => {
    const data = authorMap.get(authorName)!

    const firstGenre = data.books[0]?.genre?.[0] || "various genres"
    const lastGenre = data.books[0]?.genre?.[data.books[0].genre.length - 1] || "various genres"

    let bio = `A highly acclaimed author known for their contributions to ${firstGenre} and ${lastGenre}. With a unique narrative voice, they have captivated readers worldwide.`

    if (data.books.length > 50) {
      bio += ` Their extensive bibliography includes over ${data.books.length} published works.`
    }

    const normalizedAuthorName = authorName.replace(/\s+/g, "-").toLowerCase()
    const image = `https://i.pravatar.cc/150?u=${normalizedAuthorName}`

    return {
      name: authorName,
      bio: bio,
      image: image,
      bookCount: data.count,
      books: data.books,
    }
  })

  return authors.sort((a, b) => a.name.localeCompare(b.name))
}

// Client-side function to fetch authors via API
export const fetchAuthorsFromAPI = async (): Promise<Author[]> => {
  try {
    const response = await fetch("/api/authors")
    if (!response.ok) {
      throw new Error(`Failed to fetch authors: ${response.status}`)
    }
    const data = await response.json()
    return data.authors || []
  } catch (error) {
    console.error("Error fetching authors from API:", error)
    return []
  }
}
