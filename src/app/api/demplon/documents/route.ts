import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mengambil Documents dari Demplon
 *
 * Endpoint ini adalah PROXY yang menghindari CORS error
 * karena request dilakukan dari server-side, bukan browser.
 *
 * Endpoint: GET /api/demplon/documents
 * Query Params:
 *   - length: number (limit hasil, default 6)
 *   - reminder_active: boolean (filter dokumen dengan reminder aktif, default true)
 * Authorization: Otomatis dari NextAuth session
 *
 * @returns Array of documents dari Demplon API
 */
export async function GET(request: Request) {
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

    // Parse query parameters dari URL
    const { searchParams } = new URL(request.url);
    const length = searchParams.get("length") || "2000"; // Default 1000 dokumen
    const reminderActive = searchParams.get("reminder_active") || "false";

    console.log("📡 Fetching documents from Demplon API...");
    console.log("👤 User:", session.user.username, `(${session.user.name})`);
    console.log("🆔 User ID:", session.user.id);
    console.log("📧 User Email:", session.user.email);
    console.log("🔑 Token available:", !!session.accessToken);
    console.log("🔑 Token length:", session.accessToken.length);
    console.log(
      "🔑 Token preview:",
      session.accessToken.substring(0, 30) + "..."
    );
    console.log("📊 Query params:", {
      length,
      reminder_active: reminderActive,
    });

    // TEMPORARY: Log full token in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 [DEV] FULL TOKEN:", session.accessToken);
    }

    // Demplon Documents API endpoint - FORMAT SEDERHANA sesuai contoh:
    // https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=6&reminder_active=true
    const documentsEndpoint = `https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=${length}&reminder_active=${reminderActive}`;

    console.log("\n🔌 Calling:", documentsEndpoint);

    // Make request to Demplon API from server-side (no CORS!)
    const response = await fetch(documentsEndpoint, {
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
        console.error(
          "   1. User tidak punya permission untuk akses documents"
        );
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
        console.error("   - Request role: 'documents.read'");
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
                  step3: "Grant permission: 'documents.read'",
                  step4: "Or setup SSO-Demplon integration",
                }
              : undefined,
        },
        { status: response.status }
      );
    }

    // Parse response
    const responseData = await response.json();
    console.log("📊 Response structure:", {
      hasData: "data" in responseData,
      hasLength: "length" in responseData,
      hasTotal: "total" in responseData,
      dataType: Array.isArray(responseData.data)
        ? "Array"
        : typeof responseData.data,
    });

    // Documents API mengembalikan object: { data: [], length: 10, total: 13 }
    // Bukan langsung array seperti Archives API
    if (!responseData.data || !Array.isArray(responseData.data)) {
      console.error("⚠️ Invalid response structure:", typeof responseData);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response format",
          message: "Expected object with 'data' array property",
          receivedData: responseData,
        },
        { status: 500 }
      );
    }

    const documents = responseData.data;
    console.log(
      `✅ Successfully fetched ${documents.length} documents (total: ${responseData.total})`
    );

    // 🔍 DEBUG: Cek apakah ada dokumen dengan expire date
    const docsWithExpire = documents.filter(
      (d: { document_expire_date?: string }) => d.document_expire_date
    );
    console.log(
      `🔍 Documents with document_expire_date: ${docsWithExpire.length} / ${documents.length}`
    );
    if (docsWithExpire.length > 0) {
      console.log("📅 Sample document with expire date:", {
        id: docsWithExpire[0].id,
        title: docsWithExpire[0].title,
        document_expire_date: docsWithExpire[0].document_expire_date,
        reminder: docsWithExpire[0].reminder,
        reminder_active: docsWithExpire[0].reminder_active,
      });
    } else {
      console.warn("⚠️ WARNING: NO documents have document_expire_date field!");
      console.warn("⚠️ This means ALL reminders will be empty!");
      console.warn(
        "⚠️ Check Demplon database - are there documents with expire dates?"
      );
    }

    // Return data dengan success flag dan metadata lengkap
    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
      length: responseData.length, // Jumlah yang diminta
      total: responseData.total, // Total yang tersedia di database
      queryParams: {
        length: parseInt(length),
        reminder_active: reminderActive === "true",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in documents API route:", error);

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
