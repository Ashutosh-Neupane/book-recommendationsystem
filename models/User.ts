import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  passwordHash: string
  wishlist: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordHash: { type: String, required: true },
    wishlist: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
)

// Only create the model on the server side
let UserModel: mongoose.Model<IUser>;

// Check if we're on the server side
if (typeof window === 'undefined') {
  // Use existing model or create a new one
  UserModel = mongoose.models?.User || mongoose.model<IUser>("User", UserSchema);
}

export { UserModel }
export default UserModel
