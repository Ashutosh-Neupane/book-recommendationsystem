// src/models/bookmodel.ts
import mongoose, { Schema } from "mongoose"

const BookSchema = new Schema({
  // Fields matching the actual MongoDB document structure
  isbn: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number },
  publisher: { type: String },
  img_s: { type: String },
  img_m: { type: String },
  img_l: { type: String },
  summary: { type: String },
  language: { type: String },
  genres: { type: Array },
  rating: { type: Number }
})

export const BookModel = mongoose.models?.Book || mongoose.model("Book", BookSchema)
