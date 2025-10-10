import { Archive, Document, DemplanArchiveItem } from "./types";
import { fetchArchives } from "@/lib/api";

// ============================================
// NO DUMMY DATA - READY FOR REAL API
// ============================================
// All data will come from API only
// No fallback to dummy data

// ============================================
// REAL API DATA FETCHING
// ============================================

/**
 * Fetch archives dari Demplon API
 * Fungsi ini mengambil data arsip dari server dengan authorization dan cookies
 *
 * @param accessToken - Access token dari NextAuth session
 * @returns Promise<Archive[]> - Array of archives dari API
 *
 * Proses:
 * 1. Memanggil API Demplon dengan authorization header
 * 2. Cookies dikirim otomatis (credentials: 'include')
 * 3. Transform response dari API ke format Archive
 * 4. Jika gagal, throw error (NO fallback)
 *
 * Response Structure dari API:
 * [
 *   {
 *     "id": 17,
 *     "slug": "bmuz-tik-teknologi-informasi-komunikasi",
 *     "code": "TIK",
 *     "name": "Teknologi, Informasi & Komunikasi",
 *     "description": "...",
 *     "id_parent": null,
 *     "contributors": [...]
 *   }
 * ]
 *
 * @example
 * ```typescript
 * // Di dalam component atau page
 * import { getArchivesFromAPI } from "./data";
 *
 * // Token tidak perlu di-pass, handled otomatis server-side
 * const archives = await getArchivesFromAPI();
 * ```
 */
export async function getArchivesFromAPI(
  accessToken?: string | undefined // Optional, untuk backward compatibility
): Promise<Archive[]> {
  try {
    console.log("📡 getArchivesFromAPI() called");

    // Token parameter deprecated - sekarang handled server-side via API route
    if (accessToken) {
      console.log(
        "⚠️ Note: accessToken parameter is deprecated and will be ignored"
      );
      console.log("   Session is now handled automatically server-side");
    }

    // Call API via internal API route (no CORS, token handled server-side)
    const response = await fetchArchives();
    console.log("📦 Raw API response received");
    console.log("   - Response type:", typeof response);
    console.log("   - Is array:", Array.isArray(response));
    console.log(
      "   - Length:",
      Array.isArray(response) ? response.length : "N/A"
    );

    // Demplon API mengembalikan DIRECT ARRAY:
    // [{id: 17, ...}, {id: 41, ...}, {id: 42, ...}, ...]
    if (!Array.isArray(response)) {
      console.error("⚠️ API response bukan array!");
      console.log("Response structure:", typeof response, response);
      throw new Error(
        "Invalid API response format - expected direct array of archives"
      );
    }

    const archivesData: DemplanArchiveItem[] = response;
    console.log(
      `✅ Response is direct array with ${archivesData.length} items`
    );

    // Transform data dari API ke format Archive internal
    const archives: Archive[] = archivesData.map((item: DemplanArchiveItem) => {
      // Determine parentId:
      // - Jika id_parent ada dan tidak null, gunakan itu
      // - Jika tidak, set ke "root"
      const parentId = item.id_parent ? String(item.id_parent) : "root";

      return {
        id: String(item.id),
        name: item.name,
        code: item.code,
        parentId: parentId,
        // Optional: tambah status berdasarkan last_updated atau field lain
        status: "active", // Default status, bisa disesuaikan
      };
    });

    console.log(`✅ Successfully fetched ${archives.length} archives from API`);
    console.log("Sample archive:", archives[0]);

    return archives;
  } catch (error) {
    console.error("❌ Error fetching archives from API:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.log("⚠️ CANNOT LOAD ARCHIVES - API ERROR");
    console.log("⚠️ NO DUMMY DATA FALLBACK - Archives will be empty");

    // THROW ERROR - Jangan return dummy data
    // Biarkan caller handle error
    throw error;
  }
}

// ============================================
// DOCUMENTS - READY FOR API
// ============================================
// Documents will be fetched from API when implemented
// For now, empty array until API is ready
export const allDocuments: Document[] = [];

export const expireInOptions = [
  { id: "1w", label: "In 1 Week" },
  { id: "2w", label: "In 2 Weeks" },
  { id: "1m", label: "In 1 Month" },
  { id: "3m", label: "In 3 Months" },
  { id: "6m", label: "In 6 Months" },
  { id: "expired", label: "Already Expired" },
];
