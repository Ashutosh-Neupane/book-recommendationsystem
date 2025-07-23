import { getToken } from "./auth"

export async function getCurrentUser() {
  const token = getToken()
  if (!token) return null

  try {
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      return null
    }

    const userData = await res.json()
    return {
      ...userData,
      readBooks: Array.isArray(userData.readBooks) ? userData.readBooks : [],
      wishlist: Array.isArray(userData.wishlist) ? userData.wishlist : [],
    }
  } catch {
    return null
  }
}
