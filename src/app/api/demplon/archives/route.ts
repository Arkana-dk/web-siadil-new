import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mengambil Archives dari Demplon
 *
 * Endpoint ini adalah PROXY yang menghindari CORS error
 * karena request dilakukan dari server-side, bukan browser.
 *
 * Endpoint: GET /api/demplon/archives
 * Authorization: Otomatis dari NextAuth session
 *
 * @returns Array of archives dari Demplon API
 */
export async function GET() {
  try {
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

        // TEMPORARY: Return mock data in development untuk UI testing
        if (
          process.env.NODE_ENV === "development" &&
          process.env.USE_MOCK_ON_403 === "true"
        ) {
          console.warn("");
          console.warn("⚠️  USING MOCK DATA (403 Fallback)");
          console.warn("⚠️  Set USE_MOCK_ON_403=false in .env to disable");
          console.warn("");

          const mockArchives = [
            {
              id: 17,
              slug: "bmuz-tik-teknologi-informasi-komunikasi",
              code: "TIK",
              name: "Teknologi, Informasi & Komunikasi",
              description: "Teknologi, Informasi & Komunikasi",
              id_section: null,
              id_parent: null,
              date_created: "2024-01-15T02:09:52.000Z",
              last_updated: "2024-02-13T01:22:41.000Z",
              id_user: "1",
              parent: null,
              contributors: [],
            },
            {
              id: 41,
              slug: "mwsw-licenses-renewals-licenses-renewals",
              code: "licenses-renewals",
              name: "Licenses & Renewals",
              description: "Licenses & Renewals",
              id_section: null,
              id_parent: 17,
              date_created: "2024-02-21T04:57:02.000Z",
              last_updated: "2024-02-21T04:57:02.000Z",
              id_user: "666",
              parent: {
                id: 17,
                slug: "bmuz-tik-teknologi-informasi-komunikasi",
                code: "TIK",
                name: "Teknologi, Informasi & Komunikasi",
              },
              contributors: [],
            },
          ];

          return NextResponse.json({
            success: true,
            data: mockArchives,
            count: mockArchives.length,
            isMock: true,
            warning:
              "Using mock data because of 403 Forbidden. Contact admin Demplon to setup permission.",
            timestamp: new Date().toISOString(),
          });
        }
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

    console.log(`✅ Successfully fetched ${data.length} archives`);

    // Return data dengan success flag
    return NextResponse.json({
      success: true,
      data: data,
      count: data.length,
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
