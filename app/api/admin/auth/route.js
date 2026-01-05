

import { cookies } from "next/headers"


const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "parking123"


function generateToken() {
  return Buffer.from(`${Date.now()}-${Math.random().toString(36)}`).toString("base64")
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      
      const token = generateToken()

      
      const cookieStore = await cookies()
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 4, 
        path: "/",
      })

      return Response.json({
        success: true,
        message: "Login successful",
      })
    }

    return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Auth error:", error)
    return Response.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}


export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")

    if (token) {
      return Response.json({ authenticated: true })
    }

    return Response.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    return Response.json({ authenticated: false }, { status: 401 })
  }
}


export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("admin_token")

    return Response.json({ success: true, message: "Logged out" })
  } catch (error) {
    return Response.json({ success: false, error: "Logout failed" }, { status: 500 })
  }
}
