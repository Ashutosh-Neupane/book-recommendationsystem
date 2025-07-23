import { connectToMongo } from "./mongodb";

export interface WishlistItem {
  bookId: string;
  addedAt: Date;
}

// Client-side function to check if book is in user's wishlist
export async function isBookInWishlist(
  userId: string,
  bookId: string
): Promise<boolean> {
  try {
    // Use API endpoint instead of direct DB access for client-side
    if (typeof window !== "undefined") {
      const response = await fetch(`/api/wishlist/check?bookId=${bookId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.isInWishlist || false;
    }

    // Server-side implementation
    if (typeof window === "undefined") {
      await connectToMongo();
      // Import UserModel dynamically to avoid client-side issues
      const { UserModel } = await import("@/models/User");
      const user = await UserModel.findById(userId);
      if (!user) return false;
      return user.wishlist.includes(bookId);
    }

    return false;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
}

// Add book to wishlist - Updated to return inWishlist status
export async function addToWishlist(
  userId?: string,
  bookId?: string
): Promise<{ success: boolean; inWishlist?: boolean; error?: string }> {
  try {
    // Client-side implementation
    if (typeof window !== "undefined") {
      if (!bookId) return { success: false, error: "Book ID is required" };

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        inWishlist: response.ok ? true : undefined,
        error: !response.ok
          ? data.error || "Failed to add to wishlist"
          : undefined,
      };
    }

    // Server-side implementation
    if (typeof window === "undefined") {
      if (!userId || !bookId)
        return { success: false, error: "User ID and Book ID are required" };

      await connectToMongo();
      // Import UserModel dynamically to avoid client-side issues
      const { UserModel } = await import("@/models/User");
      const user = await UserModel.findById(userId);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (user.wishlist.includes(bookId)) {
        return {
          success: false,
          inWishlist: true,
          error: "Book already in wishlist",
        };
      }

      user.wishlist.push(bookId);
      await user.save();

      return { success: true, inWishlist: true };
    }

    return { success: false, error: "Invalid environment" };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { success: false, error: "Failed to add to wishlist" };
  }
}

// Remove book from wishlist - Updated to return inWishlist status
export async function removeFromWishlist(
  userId?: string,
  bookId?: string
): Promise<{ success: boolean; inWishlist?: boolean; error?: string }> {
  try {
    // Client-side implementation
    if (typeof window !== "undefined") {
      if (!bookId) return { success: false, error: "Book ID is required" };

      const response = await fetch(`/api/wishlist?bookId=${bookId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      return {
        success: response.ok,
        inWishlist: response.ok ? false : undefined,
        error: !response.ok
          ? data.error || "Failed to remove from wishlist"
          : undefined,
      };
    }

    // Server-side implementation
    if (typeof window === "undefined") {
      if (!userId || !bookId)
        return { success: false, error: "User ID and Book ID are required" };

      await connectToMongo();
      // Import UserModel dynamically to avoid client-side issues
      const { UserModel } = await import("@/models/User");
      const user = await UserModel.findById(userId);

      if (!user) {
        return { success: false, error: "User not found" };
      }

      user.wishlist = user.wishlist.filter((id: string) => id !== bookId);
      await user.save();

      return { success: true, inWishlist: false };
    }

    return { success: false, error: "Invalid environment" };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { success: false, error: "Failed to remove from wishlist" };
  }
}

// Toggle wishlist status - Already returns correct format
export async function toggleWishlistStatus(
  userId: string,
  bookId: string
): Promise<{ success: boolean; inWishlist: boolean; error?: string }> {
  try {
    const isInWishlist = await isBookInWishlist(userId, bookId);

    if (isInWishlist) {
      const result = await removeFromWishlist(userId, bookId);
      return {
        success: result.success,
        inWishlist: false,
        error: result.error,
      };
    } else {
      const result = await addToWishlist(userId, bookId);
      return { success: result.success, inWishlist: true, error: result.error };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return {
      success: false,
      inWishlist: false,
      error: "Failed to toggle wishlist",
    };
  }
}

// Get user's wishlist
export async function getUserWishlist(
  userId?: string
): Promise<WishlistItem[]> {
  try {
    // Client-side implementation
    if (typeof window !== "undefined") {
      const response = await fetch("/api/wishlist");
      if (!response.ok) return [];
      const data = await response.json();
      return data.wishlist || [];
    }

    // Server-side implementation
    if (typeof window === "undefined" && userId) {
      await connectToMongo();
      // Import UserModel dynamically to avoid client-side issues
      const { UserModel } = await import("@/models/User");
      const user = await UserModel.findById(userId);

      if (!user) return [];

      // Convert simple string array to WishlistItem array
      return (
        user.wishlist.map((bookId: string) => ({
          bookId,
          addedAt: new Date(),
        })) || []
      );
    }

    return [];
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return [];
  }
}

// Simple alias for backward compatibility
export const getWishlist = getUserWishlist;
