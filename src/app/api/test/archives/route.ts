import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * TEST ENDPOINT - Untuk test apakah API archives bisa diakses
 * Endpoint ini akan melakukan fetch ke Demplon API dari server-side
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No session or token",
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    console.log("🧪 TEST: Fetching archives from Demplon API...");
    console.log("🔑 TEST: Token length:", session.accessToken.length);
    console.log(
      "🔑 TEST: Token starts with:",
      session.accessToken.substring(0, 20)
    );

    // TEMPORARY: Log full token for debugging (REMOVE IN PRODUCTION!)
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 TEST: FULL TOKEN (DEV ONLY):", session.accessToken);
    }

    const apiUrl =
      "https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/";

    console.log("📡 TEST: Calling API:", apiUrl);

    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    };

    console.log("📤 TEST: Headers being sent:");
    console.log("   - Authorization: Bearer <token>");
    console.log("   - Content-Type:", headers["Content-Type"]);
    console.log(
      "   - Credentials: include (cookies will be sent automatically)"
    );
    console.log(
      "👤 TEST: User making request:",
      session.user.username,
      `(${session.user.name})`
    );

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
      credentials: "include", // Include cookies
    });

    console.log("📦 TEST: API Response Status:", response.status);
    console.log("📦 TEST: API Response OK:", response.ok);
    console.log(
      "📦 TEST: Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ TEST: API Error Response:", errorText);

      return NextResponse.json({
        success: false,
        error: `API returned ${response.status}`,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
    }

    const data = await response.json();
    console.log("✅ TEST: API Success!");
    console.log(
      "📊 TEST: Data type:",
      Array.isArray(data) ? "Array" : typeof data
    );
    console.log(
      "📊 TEST: Data length:",
      Array.isArray(data) ? data.length : "N/A"
    );

    if (Array.isArray(data) && data.length > 0) {
      console.log("📊 TEST: First item:", data[0]);
    }

    return NextResponse.json({
      success: true,
      message: "API fetch successful",
      dataType: Array.isArray(data) ? "Array" : typeof data,
      itemCount: Array.isArray(data) ? data.length : 0,
      firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null,
      data: data, // Return full data
    });
  } catch (error) {
    console.error("❌ TEST: Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
