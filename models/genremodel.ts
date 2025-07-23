import mongoose, { Schema, type Document } from "mongoose"

export interface IGenre extends Document {
  _id: string
  name: string
  description?: string
  image?: string
  books: string[] // Array of book IDs
  totalBooks: number
  averageRating: number
  popularity: number
  createdAt: Date
  updatedAt: Date
}

const GenreSchema = new Schema<IGenre>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      // Removed index: true to avoid duplicate index
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    books: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
    totalBooks: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
GenreSchema.index({ name: 1 })
GenreSchema.index({ popularity: -1 })
GenreSchema.index({ averageRating: -1 })
GenreSchema.index({ totalBooks: -1 })

export const GenreModel = mongoose.models.Genre || mongoose.model<IGenre>("Genre", GenreSchema)
