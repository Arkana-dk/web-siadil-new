import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mengambil Archives dari Demplon dengan Pagination Support
 *
 * Endpoint ini adalah PROXY yang menghindari CORS error
 * karena request dilakukan dari server-side, bukan browser.
 *
 * Endpoint: GET /api/demplon/archives?page=1&limit=300
 * Authorization: Otomatis dari NextAuth session
 *
 * Query Parameters:
 * - page: number (default: 1) - Halaman yang ingin diambil
 * - limit: number (default: 300) - Jumlah item per halaman
 *
 * @returns Paginated array of archives dari Demplon API
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "300", 10);

    console.log(`📊 Pagination params: page=${page}, limit=${limit}`);

    // Get session dari NextAuth
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session || !session.accessToken) {
      console.error("❌ No session or access token");
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Anda harus login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    console.log("📡 Fetching archives from Demplon API...");
    console.log("👤 User:", session.user.username, `(${session.user.name})`);
    console.log("� User ID:", session.user.id);
    console.log("👤 User Email:", session.user.email);
    console.log("�🔑 Token available:", !!session.accessToken);
    console.log("🔑 Token length:", session.accessToken.length);
    console.log(
      "🔑 Token preview:",
      session.accessToken.substring(0, 30) + "..."
    );

    // TEMPORARY: Log full token in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 [DEV] FULL TOKEN:", session.accessToken);
    }

    // Demplon Archives API endpoint
    const archivesEndpoint =
      "https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/";

    console.log("\n🔌 Calling:", archivesEndpoint);

    // Make request to Demplon API from server-side (no CORS!)
    const response = await fetch(archivesEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    console.log("📦 Response status:", response.status, response.statusText);
    console.log("📦 Content-Type:", response.headers.get("content-type"));

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Demplon API Error Response:");
      console.error("   Status:", response.status, response.statusText);
      console.error("   Body:", errorText);

      // Parse error if it's JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      // Special handling untuk 403 Forbidden
      if (response.status === 403) {
        console.error("🔒 403 FORBIDDEN - Possible causes:");
        console.error("   1. User tidak punya permission untuk akses archives");
        console.error("   2. Token SSO tidak valid untuk Demplon API");
        console.error("   3. User belum di-assign ke Demplon system");
        console.error("");
        console.error("💡 Action Required:");
        console.error("   - Hubungi admin Demplon untuk setup user permission");
        console.error(
          "   - Kirim user details: ID=" +
            session.user.id +
            ", Username=" +
            session.user.username
        );
        console.error("   - Request role: 'archives.read'");
      }

      return NextResponse.json(
        {
          success: false,
          error: `Demplon API returned ${response.status}`,
          status: response.status,
          statusText: response.statusText,
          details: errorData,
          actionRequired:
            response.status === 403
              ? {
                  step1: "Contact Demplon admin",
                  step2: `Register user: ${session.user.username} (ID: ${session.user.id})`,
                  step3: "Grant permission: 'archives.read'",
                  step4: "Or setup SSO-Demplon integration",
                }
              : undefined,
        },
        { status: response.status }
      );
    }

    // Parse response
    const data = await response.json();
    console.log(
      "📊 Response type:",
      Array.isArray(data) ? "Array" : typeof data
    );
    console.log("📊 Data length:", Array.isArray(data) ? data.length : "N/A");

    // Validate response is array
    if (!Array.isArray(data)) {
      console.error("⚠️ Response bukan array:", typeof data);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response format",
          message: "Expected array of archives but got " + typeof data,
          receivedData: data,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched ${data.length} total archives`);

    // Apply pagination manually (since Demplon API returns all data)
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    const hasMore = page < totalPages;

    console.log(
      `📄 Returning page ${page}/${totalPages} (${paginatedData.length} items)`
    );
    console.log(
      `   - Range: ${startIndex + 1} to ${Math.min(endIndex, totalItems)}`
    );
    console.log(`   - Has more: ${hasMore}`);

    // Return data dengan pagination info
    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
        hasMore,
        startIndex,
        endIndex: Math.min(endIndex, totalItems),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in archives API route:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
