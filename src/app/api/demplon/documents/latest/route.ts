import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mengambil Dokumen Terbaru dari Demplon dengan Sorting
 *
 * Endpoint ini adalah PROXY yang menghindari CORS error
 * karena request dilakukan dari server-side, bukan browser.
 *
 * Endpoint: GET /api/demplon/documents/latest
 * Query Params:
 *   - start: number (offset pagination, default 0)
 *   - length: number (jumlah data yang diambil, default 10)
 *   - sort[]: string[] (field untuk sorting, default ['id'])
 *   - sortdir[]: string[] (arah sorting ASC/DESC, default ['DESC'])
 *
 * Authorization: Otomatis dari NextAuth session
 *
 * Contoh request:
 * GET /api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC
 *
 * @returns Dokumen terbaru dari Demplon API dengan sorting
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
    const start = searchParams.get("start") || "0";
    const length = searchParams.get("length") || "10";

    // Handle array parameters untuk sort dan sortdir
    const sortParams = searchParams.getAll("sort[]");
    const sortdirParams = searchParams.getAll("sortdir[]");

    // Default values jika tidak ada
    const sort = sortParams.length > 0 ? sortParams : ["id"];
    const sortdir = sortdirParams.length > 0 ? sortdirParams : ["DESC"];

    console.log("📡 Fetching latest documents from Demplon API...");
    console.log("👤 User:", session.user.username, `(${session.user.name})`);
    console.log("🆔 User ID:", session.user.id);
    console.log("📧 User Email:", session.user.email);
    console.log("🔑 Token available:", !!session.accessToken);
    console.log("📊 Query params:", {
      start,
      length,
      sort,
      sortdir,
    });

    // Build URL dengan query parameters untuk sorting
    const baseUrl =
      "https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/";
    const params = new URLSearchParams();
    params.append("start", start);
    params.append("length", length);

    // Tambahkan array parameters
    sort.forEach((s) => params.append("sort[]", s));
    sortdir.forEach((d) => params.append("sortdir[]", d));

    const documentsEndpoint = `${baseUrl}?${params.toString()}`;

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
        console.error("🔒 403 FORBIDDEN - Kemungkinan penyebab:");
        console.error(
          "   1. User tidak memiliki permission untuk mengakses dokumen"
        );
        console.error("   2. Token SSO tidak valid untuk Demplon API");
        console.error("   3. User belum di-assign ke sistem Demplon");
        console.error("");
        console.error("💡 Tindakan yang diperlukan:");
        console.error("   - Hubungi admin Demplon untuk setup user permission");
        console.error(
          "   - Kirim detail user: ID=" +
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
                  step1: "Hubungi admin Demplon",
                  step2: `Daftarkan user: ${session.user.username} (ID: ${session.user.id})`,
                  step3: "Berikan permission: 'documents.read'",
                  step4: "Atau setup integrasi SSO-Demplon",
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
      hasRecordsTotal: "recordsTotal" in responseData,
      hasRecordsFiltered: "recordsFiltered" in responseData,
      dataType: Array.isArray(responseData.data)
        ? "Array"
        : typeof responseData.data,
    });

    // Validasi response structure
    // API endpoint ini mengembalikan: { data: [], recordsTotal: 150, recordsFiltered: 150, draw: 1 }
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
    const recordsTotal = responseData.recordsTotal || documents.length;
    const recordsFiltered = responseData.recordsFiltered || documents.length;

    console.log(`✅ Successfully fetched ${documents.length} latest documents`);
    console.log(`   - Total records: ${recordsTotal}`);
    console.log(`   - Filtered records: ${recordsFiltered}`);

    // Return data dengan success flag dan metadata lengkap
    return NextResponse.json({
      success: true,
      data: documents,
      recordsTotal,
      recordsFiltered,
      draw: responseData.draw || 1,
      queryParams: {
        start: parseInt(start),
        length: parseInt(length),
        sort,
        sortdir,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in latest documents API route:", error);

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
