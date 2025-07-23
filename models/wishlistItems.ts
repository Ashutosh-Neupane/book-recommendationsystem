import { Schema, model, models, type Types, type Document } from "mongoose"

export interface IWishlistItem extends Document {
  userId: Types.ObjectId
  bookId: string
  addedAt: Date
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

// Create compound index for efficient queries
WishlistItemSchema.index({ userId: 1, bookId: 1 }, { unique: true })

export const WishlistItemModel = models.WishlistItem || model<IWishlistItem>("WishlistItem", WishlistItemSchema)
export default WishlistItemModel
