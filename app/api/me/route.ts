import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { connectToMongo } from "@/lib/mongodb"
import { UserModel } from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any

    await connectToMongo()
    const user = await UserModel.findById(decoded.id).select("-password -passwordHash")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
