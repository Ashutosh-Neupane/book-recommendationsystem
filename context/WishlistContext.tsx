"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getToken, getCurrentUser } from "@/lib/auth";

interface WishlistContextType {
  wishlistItems: string[];
  isLoading: boolean;
  error: string | null;
  checkWishlistStatus: (bookId: string) => boolean;
  toggleWishlistStatus: (bookId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      setError(null);
      const token = getToken();

      if (!token) {
        console.log("🔒 No token found, clearing wishlist");
        setWishlistItems([]);
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No current user, clearing wishlist");
        setWishlistItems([]);
        setIsLoading(false);
        return;
      }

      const baseUrl =
        typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000";

      console.log("📡 Fetching wishlist...");
      const response = await fetch(`${baseUrl}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("🔒 Unauthorized, clearing wishlist");
          setWishlistItems([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📋 Wishlist data received:", data);

      let items: string[] = [];

      // Handle different possible response formats
      if (data.wishlist && Array.isArray(data.wishlist)) {
        items = data.wishlist
          .map((item: any) => {
            // Handle different item formats
            if (typeof item === "string") return item;
            return item.bookId || item._id || item.id || null;
          })
          .filter(Boolean);
      } else if (Array.isArray(data)) {
        items = data
          .map((item: any) => {
            if (typeof item === "string") return item;
            return item.bookId || item._id || item.id || null;
          })
          .filter(Boolean);
      } else if (data.success && Array.isArray(data.data)) {
        items = data.data
          .map((item: any) => {
            if (typeof item === "string") return item;
            return item.bookId || item._id || item.id || null;
          })
          .filter(Boolean);
      }

      console.log("✅ Processed wishlist items:", items);
      setWishlistItems(items);
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch wishlist"
      );
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch wishlist on mount and when token changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const checkWishlistStatus = useCallback(
    (bookId: string): boolean => {
      return wishlistItems.includes(bookId);
    },
    [wishlistItems]
  );

  const toggleWishlistStatus = useCallback(
    async (bookId: string): Promise<boolean> => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const isInWishlist = wishlistItems.includes(bookId);
        const action = isInWishlist ? "remove" : "add";

        console.log(
          `📤 ${action}ing book ${bookId} ${
            isInWishlist ? "from" : "to"
          } wishlist`
        );

        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";

        const response = await fetch(`${baseUrl}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId,
            action,
          }),
        });

        console.log("📡 Toggle response status:", response.status);

        if (!response.ok) {
          let errorMessage = "Failed to update wishlist";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("📋 Toggle response data:", data);

        // Update local state immediately for better UX
        if (action === "add") {
          setWishlistItems((prev) => [...prev, bookId]);
        } else {
          setWishlistItems((prev) => prev.filter((id) => id !== bookId));
        }

        // Also refresh from server to ensure consistency
        setTimeout(() => fetchWishlist(), 100);

        return action === "add";
      } catch (error) {
        console.error("❌ Error toggling wishlist:", error);
        throw error;
      }
    },
    [wishlistItems, fetchWishlist]
  );

  const refreshWishlist = useCallback(async () => {
    setIsLoading(true);
    await fetchWishlist();
  }, [fetchWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        error,
        checkWishlistStatus,
        toggleWishlistStatus,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
