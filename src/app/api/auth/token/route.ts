import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mendapatkan access token
 * Karena session cookie terlalu besar (chunking issue),
 * kita ambil token dari server-side session
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("🔑 Token API - Session check:", session ? "EXISTS" : "NULL");
    console.log(
      "🔑 Token API - AccessToken:",
      session?.accessToken ? "EXISTS" : "NULL"
    );

    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No session or token" },
        { status: 401 }
      );
    }

    // Log token preview untuk debugging (hati-hati, jangan log full token di production!)
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🔑 Token Preview (first 50 chars):",
        session.accessToken.substring(0, 50)
      );
      console.log("🔑 Token Length:", session.accessToken.length);
    }

    return NextResponse.json({
      accessToken: session.accessToken,
      tokenPreview: session.accessToken.substring(0, 50) + "...",
      tokenLength: session.accessToken.length,
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("❌ Token API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
