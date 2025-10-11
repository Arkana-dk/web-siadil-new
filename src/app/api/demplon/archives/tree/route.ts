import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * API Route untuk mengambil Archives dalam Format Tree dari Demplon
 *
 * Endpoint ini adalah PROXY yang menghindari CORS error
 * karena request dilakukan dari server-side, bukan browser.
 *
 * Endpoint: GET /api/demplon/archives/tree
 * Query Params:
 *   - tree: boolean (default true, untuk mendapatkan struktur hierarkis)
 *
 * Authorization: Otomatis dari NextAuth session
 *
 * Format Tree Structure:
 * Mengembalikan archives dalam format hierarkis dengan relasi parent-child
 * yang memudahkan untuk menampilkan tree view atau folder structure.
 *
 * @returns Hierarchical tree structure of archives dari Demplon API
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
    const tree = searchParams.get("tree") || "true";

    console.log("📡 Fetching archives tree from Demplon API...");
    console.log("👤 User:", session.user.username, `(${session.user.name})`);
    console.log("🆔 User ID:", session.user.id);
    console.log("📧 User Email:", session.user.email);
    console.log("🔑 Token available:", !!session.accessToken);
    console.log("🔑 Token length:", session.accessToken.length);
    console.log(
      "🔑 Token preview:",
      session.accessToken.substring(0, 30) + "..."
    );
    console.log("📊 Query params:", { tree });

    // TEMPORARY: Log full token in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("🔑 [DEV] FULL TOKEN:", session.accessToken);
    }

    // Demplon Archives API endpoint dengan tree parameter
    const archivesEndpoint = `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=${tree}`;

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
        console.error("🔒 403 FORBIDDEN - Kemungkinan penyebab:");
        console.error(
          "   1. User tidak memiliki permission untuk mengakses archives"
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
                  step1: "Hubungi admin Demplon",
                  step2: `Daftarkan user: ${session.user.username} (ID: ${session.user.id})`,
                  step3: "Berikan permission: 'archives.read'",
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
      isArray: Array.isArray(responseData),
      hasChildren:
        Array.isArray(responseData) && responseData.length > 0
          ? "children" in responseData[0]
          : false,
      dataType: Array.isArray(responseData) ? "Array" : typeof responseData,
    });

    // Archives Tree API mengembalikan DIRECT ARRAY dengan children property:
    // [
    //   {
    //     id: 17,
    //     code: "TIK",
    //     name: "Teknologi",
    //     id_parent: null,
    //     children: [
    //       { id: 146, code: "DOK", name: "Dokumentasi", id_parent: 17, children: [] }
    //     ]
    //   }
    // ]
    if (!Array.isArray(responseData)) {
      console.error("⚠️ API response bukan array!");
      console.log("Response structure:", typeof responseData, responseData);
      throw new Error(
        "Invalid API response format - expected direct array of archives with tree structure"
      );
    }

    const archivesTree = responseData;
    console.log(
      `✅ Response is tree array with ${archivesTree.length} root items`
    );

    // Hitung total archives termasuk children
    interface ArchiveWithChildren {
      children?: ArchiveWithChildren[];
    }

    const countTotalArchives = (archives: ArchiveWithChildren[]): number => {
      let count = 0;
      for (const archive of archives) {
        count += 1;
        if (Array.isArray(archive.children)) {
          count += countTotalArchives(archive.children);
        }
      }
      return count;
    };

    const totalCount = countTotalArchives(archivesTree);

    console.log(
      `✅ Successfully fetched ${archivesTree.length} root archives (${totalCount} total including children)`
    );
    console.log("Sample root archive:", archivesTree[0]);
    if (archivesTree[0]?.children?.length > 0) {
      console.log("Sample child archive:", archivesTree[0].children[0]);
    }

    // Return data dengan success flag dan metadata lengkap
    return NextResponse.json({
      success: true,
      data: archivesTree,
      rootCount: archivesTree.length,
      totalCount: totalCount,
      isTree: true,
      queryParams: {
        tree: tree === "true",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in archives tree API route:", error);

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
