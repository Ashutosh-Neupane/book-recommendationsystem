// types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

// Re-export the Book interface from books-data to avoid conflicts
export type { Book } from "@/lib/books-data";

// Main Review interface - matches your API response
export interface Review {
  _id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string; // ISO string from API
  updatedAt: string; // ISO string from API
}

// Raw review data from database
export interface RawReview {
  _id?: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Wishlist item interface
export interface WishlistItem {
  _id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  updatedAt: string;
}

// Raw wishlist item from database
export interface RawWishlistItem {
  _id?: string;
  userId: string;
  bookId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// API response types
export interface WishlistResponse {
  success: boolean;
  wishlist: WishlistItem[];
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

// Form interfaces
export interface ReviewSubmission {
  bookId: string;
  rating: number;
  comment: string;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}
