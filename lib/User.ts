import { UserModel, IUser } from "@/models/User";
import { connectToMongo } from "./mongodb";
import bcrypt from "bcryptjs";

export async function createUser(
  email: string,
  password: string,
  name: string
): Promise<IUser> {
  await connectToMongo();

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = new UserModel({
    email,
    passwordHash,
    name,
  });

  await newUser.save();

  return newUser;
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectToMongo();

  return UserModel.findOne({ email });
}

export async function verifyPassword(
  user: IUser,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
