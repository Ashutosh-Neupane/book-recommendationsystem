export interface AuthUser {
  id: string
  name: string
  email: string
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken()
  if (!token) return null

  try {
    const response = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      removeToken()
      return null
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    removeToken()
    return null
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      setToken(data.token)
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || "Login failed" }
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Network error" }
  }
}

export async function signup(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    console.log("Sending signup request with:", { username, email })
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      setToken(data.token)
      return { success: true, user: data.user }
    } else if (data.message && data.message.includes("User already exists") && data.token && data.user) {
      // Handle the case where user already exists but we got back a token and user data
      setToken(data.token)
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || "Signup failed" }
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Network error" }
  }
}

export async function logout(): Promise<void> {
  try {
    const token = getToken()
    if (token) {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }
  } catch (error) {
    console.error("Logout error:", error)
  } finally {
    removeToken()
  }
}
