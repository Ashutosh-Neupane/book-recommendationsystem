import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToMongo } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 })
    }

    await connectToMongo()
    
    // Import UserModel dynamically to avoid client-side issues
    const { UserModel } = await import("@/models/User")
    const user = await UserModel.findById(decoded.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isInWishlist = user.wishlist.includes(bookId)

    return NextResponse.json({ isInWishlist })
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}