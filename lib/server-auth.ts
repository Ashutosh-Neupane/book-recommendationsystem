import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export interface ServerUser {
  id: string
  name: string
  email: string
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token || !process.env.JWT_SECRET) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
    }
  } catch (error) {
    console.error("Server auth error:", error)
    return null
  }
}

export async function setServerAuthCookie(user: ServerUser) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  )

  const cookieStore = await cookies()
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  })

  return token
}

export async function clearServerAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
}
