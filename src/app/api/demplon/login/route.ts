import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Login ke Demplon Admin untuk mendapatkan session cookies
 * Endpoint Demplon mungkin memerlukan login tersendiri
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "No session - please login first" },
        { status: 401 }
      );
    }

    console.log("🔐 Attempting Demplon login for user:", session.user.username);

    // Coba login ke Demplon menggunakan kredensial dari session
    // Ini adalah percobaan - endpoint mungkin berbeda
    const demplanLoginUrl =
      "https://demplon.pupuk-kujang.co.id/admin/api/auth/login";

    const loginPayload = {
      username: session.user.username,
      // NOTE: Kita tidak punya password di session
      // Alternatif: gunakan SSO token
      token: session.accessToken,
    };

    console.log("📡 Calling Demplon login:", demplanLoginUrl);
    console.log("📤 Payload:", { ...loginPayload, token: "***hidden***" });

    const response = await fetch(demplanLoginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(loginPayload),
      credentials: "include",
    });

    console.log("📦 Demplon login response:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Demplon login failed:", errorText);

      return NextResponse.json({
        success: false,
        error: `Demplon login failed: ${response.status}`,
        details: errorText,
        suggestion:
          "Token dari SSO mungkin tidak valid untuk Demplon API. Coba check dengan tim backend tentang cara authenticate ke Demplon.",
      });
    }

    const data = await response.json();
    console.log("✅ Demplon login success!");

    // Extract cookies dari response
    const setCookieHeaders = response.headers.getSetCookie();
    console.log("🍪 Set-Cookie headers:", setCookieHeaders);

    return NextResponse.json({
      success: true,
      message: "Demplon login successful",
      data: data,
      cookies: setCookieHeaders,
    });
  } catch (error) {
    console.error("❌ Demplon login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
