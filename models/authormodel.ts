import mongoose, { Schema, type Document } from "mongoose"

export interface IAuthor extends Document {
  _id: string
  name: string
  bio?: string
  birthDate?: Date
  nationality?: string
  image?: string
  books: string[] // Array of book IDs
  totalBooks: number
  averageRating: number
  createdAt: Date
  updatedAt: Date
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // Removed index: true to avoid duplicate index
    },
    bio: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    nationality: {
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
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance
AuthorSchema.index({ name: 1 })
AuthorSchema.index({ averageRating: -1 })
AuthorSchema.index({ totalBooks: -1 })

export const AuthorModel = mongoose.models.Author || mongoose.model<IAuthor>("Author", AuthorSchema)
