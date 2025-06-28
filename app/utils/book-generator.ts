interface Book {
  id: number
  title: string
  author: string
  genre: string
  rating: number
  description: string
  cover: string
  year: number
  pages: number
}

const genres = [
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Romance",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Biography",
  "Science",
  "Philosophy",
  "Self-Help",
  "Business",
  "Technology",
  "Art",
  "Travel",
  "Space Opera",
  "Cyberpunk",
  "Dystopian",
  "Adventure",
  "Comedy",
]

const authors = [
  "Isaac Asimov",
  "Ursula K. Le Guin",
  "Philip K. Dick",
  "Arthur C. Clarke",
  "Ray Bradbury",
  "Frank Herbert",
  "Carl Sagan",
  "Neil deGrasse Tyson",
  "Mary Roach",
  "Andy Weir",
  "Kim Stanley Robinson",
  "Becky Chambers",
  "Martha Wells",
  "Liu Cixin",
  "Octavia Butler",
  "Douglas Adams",
  "Terry Pratchett",
  "Neil Gaiman",
  "Brandon Sanderson",
  "Patrick Rothfuss",
  "George R.R. Martin",
  "J.K. Rowling",
  "Stephen King",
  "Agatha Christie",
  "Dan Brown",
  "Gillian Flynn",
  "Tana French",
  "Louise Penny",
  "John le Carré",
  "Ian Fleming",
  "Tom Clancy",
  "Michael Crichton",
  "Margaret Atwood",
  "Aldous Huxley",
  "George Orwell",
  "Suzanne Collins",
  "Veronica Roth",
  "James Dashner",
  "Rick Riordan",
  "Cassandra Clare",
]

const titlePrefixes = [
  "The",
  "A",
  "An",
  "Beyond",
  "Into",
  "Through",
  "Across",
  "Under",
  "Above",
  "Within",
  "Without",
  "Before",
  "After",
  "During",
  "Among",
]

const titleWords = [
  "Galaxy",
  "Star",
  "Planet",
  "Moon",
  "Cosmos",
  "Universe",
  "Void",
  "Nebula",
  "Quantum",
  "Infinity",
  "Eternity",
  "Time",
  "Space",
  "Dimension",
  "Reality",
  "Dream",
  "Shadow",
  "Light",
  "Dark",
  "Fire",
  "Ice",
  "Storm",
  "Wind",
  "Ocean",
  "Mountain",
  "Forest",
  "Desert",
  "City",
  "Kingdom",
  "Empire",
  "Chronicles",
  "Tales",
  "Stories",
  "Legends",
  "Myths",
  "Secrets",
  "Mysteries",
  "Adventures",
  "Journey",
  "Quest",
  "Mission",
  "Discovery",
  "Revelation",
]

const descriptions = [
  "An epic journey through space and time that challenges our understanding of reality.",
  "A thrilling adventure that explores the depths of human nature and cosmic mysteries.",
  "A captivating tale of discovery, love, and the infinite possibilities of the universe.",
  "An extraordinary exploration of science, philosophy, and the meaning of existence.",
  "A mind-bending story that weaves together technology, humanity, and cosmic wonder.",
  "A fascinating journey into the unknown realms of space and consciousness.",
  "An inspiring tale of courage, discovery, and the endless quest for knowledge.",
  "A compelling narrative that bridges science and imagination in unexpected ways.",
  "A thought-provoking exploration of future possibilities and human potential.",
  "An engaging story that combines adventure, mystery, and cosmic revelation.",
]

function generateRandomTitle(): string {
  const usePrefix = Math.random() > 0.3
  const prefix = usePrefix ? titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)] + " " : ""
  const word1 = titleWords[Math.floor(Math.random() * titleWords.length)]
  const useSecondWord = Math.random() > 0.4
  const word2 = useSecondWord ? " of " + titleWords[Math.floor(Math.random() * titleWords.length)] : ""

  return prefix + word1 + word2
}

export function generateSampleBooks(count: number): Book[] {
  const books: Book[] = []

  for (let i = 1; i <= count; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)]
    const author = authors[Math.floor(Math.random() * authors.length)]
    const title = generateRandomTitle()
    const rating = Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0 to 5.0
    const year = Math.floor(Math.random() * 50) + 1974 // 1974 to 2024
    const pages = Math.floor(Math.random() * 600) + 150 // 150 to 750 pages
    const description = descriptions[Math.floor(Math.random() * descriptions.length)]

    books.push({
      id: i,
      title,
      author,
      genre,
      rating,
      description,
      cover: `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(title.slice(0, 20))}`,
      year,
      pages,
    })
  }

  return books
}
