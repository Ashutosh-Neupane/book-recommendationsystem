import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { connectToMongo } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, username } = await request.json()
    
    // Use username as name if provided (for compatibility with the frontend)
    const userName = username || name

    if (!userName || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }
    
    // Log the request data for debugging
    console.log("Signup request:", { userName, email })

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    await connectToMongo()
    
    // Import UserModel dynamically to avoid client-side issues
    const { UserModel } = await import('@/models/User')

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      // Instead of just returning an error, let's try to log the user in directly
      // Generate JWT token for the existing user
      if (!process.env.JWT_SECRET) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
      }
      
      const token = jwt.sign(
        {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )
      
      // Set HTTP-only cookie
      const response = NextResponse.json({
        message: "User already exists, logged in",
        token,
        user: {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
        },
      })
      
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })
      
      return response
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const user = new UserModel({
      name: userName,
      email,
      password: hashedPassword,
      passwordHash: hashedPassword,
      wishlist: [],
    })

    await user.save()

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
