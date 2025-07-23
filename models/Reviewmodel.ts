import { Schema, model, models, type Document } from "mongoose";

export interface IReview extends Document {
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ bookId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });

export const ReviewModel =
  models?.Review || model<IReview>("Review", ReviewSchema);
export default ReviewModel;
