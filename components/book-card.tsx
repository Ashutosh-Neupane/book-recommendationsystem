"use client";

import type React from "react";
import { useState } from "react";
import FallbackImage from "./fallback-image";
import Link from "next/link";
import { Heart, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/WishlistContext";
import type { Book } from "@/lib/books-data";

interface BookCardProps {
  book: Book;
  user?: { name: string; email: string } | null;
}

export default function BookCard({ book, user }: BookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { checkWishlistStatus, toggleWishlistStatus } = useWishlist();
  const { toast } = useToast();

  const isInWishlist = checkWishlistStatus(book.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add books to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newStatus = await toggleWishlistStatus(book.id);

      toast({
        title: newStatus ? "Added to Wishlist" : "Removed from Wishlist",
        description: newStatus
          ? `"${book.title}" has been added to your wishlist.`
          : `"${book.title}" has been removed from your wishlist.`,
      });
    } catch (error) {
      console.error("❌ Error toggling wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure genres is always an array
  const genres = Array.isArray(book.genre) ? book.genre : [];
  const displayGenres = genres.slice(0, 2); // Show only first 2 genres

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <div className="relative">
        <Link href={`/book/${book.id}`}>
          <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
            <FallbackImage
              src={book.coverImage || "/placeholder.svg?height=400&width=300"}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Wishlist Heart Button - Only show if user is logged in */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 rounded-full transition-all duration-200 z-10 ${
              isInWishlist
                ? ""
                : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
            }`}
            onClick={toggleWishlist}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 transition-all duration-200 ${
                  isInWishlist ? "fill-red-500 text-red-500" : "fill-none"
                } ${isLoading ? "animate-pulse" : ""}`}
              />
            )}
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        <Link href={`/book/${book.id}`}>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-1">
              by {book.author}
            </p>

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {book.rating}
              </span>
              <span className="text-xs text-gray-500">
                ({book.publishedYear})
              </span>
            </div>

            {displayGenres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {displayGenres.map((genre, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1"
                  >
                    {genre}
                  </Badge>
                ))}
                {genres.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{genres.length - 2}
                  </Badge>
                )}
              </div>
            )}

            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {book.description}
            </p>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
