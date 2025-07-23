import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongo } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    await connectToMongo();

    // Import UserModel dynamically to avoid client-side issues
    const { UserModel } = await import("@/models/User");
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert simple string array to WishlistItem array
    const wishlist =
      user.wishlist.map((bookId: string) => ({
        bookId,
        addedAt: new Date(),
      })) || [];

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const { bookId, action } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    await connectToMongo();

    // Import UserModel dynamically to avoid client-side issues
    const { UserModel } = await import("@/models/User");
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isCurrentlyInWishlist = user.wishlist.includes(bookId);

    // Handle different actions or default to toggle behavior
    if (action === "add") {
      if (isCurrentlyInWishlist) {
        return NextResponse.json(
          {
            error: "Book already in wishlist",
            inWishlist: true,
          },
          { status: 400 }
        );
      }
      user.wishlist.push(bookId);
      await user.save();
      return NextResponse.json({
        success: true,
        inWishlist: true,
        message: "Book added to wishlist",
      });
    } else if (action === "remove") {
      user.wishlist = user.wishlist.filter((id: string) => id !== bookId);
      await user.save();
      return NextResponse.json({
        success: true,
        inWishlist: false,
        message: "Book removed from wishlist",
      });
    } else {
      // Default toggle behavior (this is what your client is doing)
      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        user.wishlist = user.wishlist.filter((id: string) => id !== bookId);
        await user.save();
        return NextResponse.json({
          success: true,
          inWishlist: false,
          message: "Book removed from wishlist",
        });
      } else {
        // Add to wishlist
        user.wishlist.push(bookId);
        await user.save();
        return NextResponse.json({
          success: true,
          inWishlist: true,
          message: "Book added to wishlist",
        });
      }
    }
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    await connectToMongo();

    // Import UserModel dynamically to avoid client-side issues
    const { UserModel } = await import("@/models/User");
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.wishlist = user.wishlist.filter((id: string) => id !== bookId);
    await user.save();

    return NextResponse.json({
      success: true,
      inWishlist: false,
      message: "Book removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
