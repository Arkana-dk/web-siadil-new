import {
  Archive,
  Contributor,
  Document,
  DemplanArchiveItem,
  DemplonDocumentItem,
} from "./types";
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

/**
 * Fetch documents dari Demplon API dengan Pagination Support
 * Fungsi ini mengambil data dokumen dari server dengan authorization
 *
 * @param accessToken - Access token dari NextAuth session (optional, handled server-side)
 * @param options - Query options untuk API
 *   - length: number (limit hasil per page, default 300)
 *   - start: number (offset untuk pagination, default 0)
 *   - reminder_active: boolean (filter dokumen dengan reminder aktif)
 * @returns Promise<{ documents: Document[], total: number, hasMore: boolean }> - Documents dengan pagination info
 *
 * Response Structure dari API (via /api/demplon/documents):
 * {
 *   "success": true,
 *   "data": [...],    // Array of DemplonDocumentItem
 *   "count": 10,      // Jumlah data yang dikembalikan
 *   "length": 300,    // Limit yang diminta
 *   "total": 45       // Total dokumen di database
 * }
 */
export async function getDocumentsFromAPI(
  accessToken?: string | undefined,
  options?: {
    length?: number;
    start?: number;
    reminder_active?: boolean;
  }
): Promise<{ documents: Document[]; total: number; hasMore: boolean }> {
  try {
    console.log("📡 getDocumentsFromAPI() called");

    // Token parameter deprecated - handled server-side via API route
    if (accessToken) {
      console.log(
        "⚠️ Note: accessToken parameter is deprecated and will be ignored"
      );
      console.log("   Session is now handled automatically server-side");
    }

    const length = options?.length || 800; // 🔥 UPDATED: Default 800 per page (lebih cepat!)
    const start = options?.start || 0; // Offset untuk pagination
    const reminderActive =
      options?.reminder_active !== undefined ? options.reminder_active : false;

    console.log(
      `📊 Fetching documents with params: start=${start}, length=${length}, reminder_active=${reminderActive}`
    );

    // Call API via internal API route dengan pagination support
    // Contoh: /api/demplon/documents?start=0&length=300&reminder_active=false
    const url = `/api/demplon/documents?start=${start}&length=${length}&reminder_active=${reminderActive}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    console.log("📦 Documents API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Documents API error:", errorData);
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    const totalDocuments = result.total || 0;
    const fetchedCount = result.count || 0;
    const hasMore = start + fetchedCount < totalDocuments;

    console.log("📦 Documents API response received");
    console.log("   - Success:", result.success);
    console.log("   - Count:", fetchedCount);
    console.log("   - Start:", start);
    console.log("   - Total:", totalDocuments);
    console.log("   - Has More:", hasMore);

    if (!result.success || !Array.isArray(result.data)) {
      console.error("⚠️ Invalid API response format");
      throw new Error("Invalid API response format");
    }

    const documentsData = result.data;
    console.log(`✅ Got ${documentsData.length} documents from API`);

    // 🔍 DEBUG: Log first 3 documents archive mapping
    if (documentsData.length > 0) {
      console.log("   📄 Sample documents:");
      documentsData
        .slice(0, 3)
        .forEach((item: DemplonDocumentItem, idx: number) => {
          console.log(
            `      ${idx + 1}. "${item.title?.substring(
              0,
              40
            )}" → Archive ID: ${item.id_archive} (${item.archive?.code})`
          );
        });
    }

    // Transform data dari API ke format Document internal
    const documents: Document[] = documentsData.map(
      (item: DemplonDocumentItem) => {
        const archiveCode = item.archive?.code || "UNKNOWN";
        const archiveName = item.archive?.name || archiveCode || "Unknown";
        const archiveDataForRecovery = item.archive; // 🔥 NEW: Simpan archive object

        const normalizeDate = (value?: string | null, fallback?: string) => {
          if (!value) {
            return fallback || "";
          }
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) {
            return fallback || "";
          }
          return parsed.toISOString().split("T")[0];
        };

        const documentDate = normalizeDate(
          item.document_date,
          new Date().toISOString().split("T")[0]
        );
        const expireDateRaw = normalizeDate(item.document_expire_date, "");
        const expireDateObject = item.document_expire_date
          ? new Date(item.document_expire_date)
          : null;

        const today = new Date();
        const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        let daysUntilExpire: number | null = null;
        if (expireDateObject && !Number.isNaN(expireDateObject.getTime())) {
          const diffMs = expireDateObject.getTime() - startOfToday.getTime();
          daysUntilExpire = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        const documentExpired = Boolean(
          item.document_expired ||
            (typeof daysUntilExpire === "number" && daysUntilExpire < 0)
        );

        let expireStatus: Document["expireStatus"] = "noExpire";
        if (expireDateObject && !Number.isNaN(expireDateObject.getTime())) {
          if (documentExpired) {
            expireStatus = "expired";
          } else if (
            typeof daysUntilExpire === "number" &&
            daysUntilExpire <= 30
          ) {
            expireStatus = "expiringSoon";
          } else {
            expireStatus = "active";
          }
        }

        let status = "Active";
        if (documentExpired) {
          status = "Expired";
        } else if (expireStatus === "expiringSoon") {
          status = "Expiring Soon";
        }

        const filesCount = Array.isArray(item.files) ? item.files.length : 0;
        const primaryFile =
          Array.isArray(item.files) && item.files.length > 0
            ? item.files[0]
            : undefined;
        const fileType = primaryFile?.file?.split(".").pop() || "unknown";

        const contributorList: Contributor[] = Array.isArray(item.contributors)
          ? item.contributors
              .map((contributor) => {
                if (contributor && typeof contributor === "object") {
                  const raw = contributor as Record<string, unknown>;
                  const name =
                    typeof raw.name_user === "string"
                      ? raw.name_user
                      : typeof raw.name === "string"
                      ? raw.name
                      : undefined;
                  const role =
                    typeof raw.mode === "string"
                      ? raw.mode
                      : typeof raw.role === "string"
                      ? raw.role
                      : "Member";
                  if (name) {
                    return { name, role } as Contributor;
                  }
                } else if (typeof contributor === "string") {
                  return { name: contributor, role: "Member" } as Contributor;
                }
                return null;
              })
              .filter((entry): entry is Contributor => entry !== null)
          : [];

        const hasApiReminder = Boolean(item.reminder_active ?? item.reminder);
        const derivedReminderType = !hasApiReminder
          ? documentExpired
            ? "error"
            : expireStatus === "expiringSoon"
            ? "warning"
            : undefined
          : undefined;

        const normalizedReminderType =
          item.reminder_type ||
          (hasApiReminder && documentExpired ? "error" : undefined) ||
          derivedReminderType;

        const reminderSource: Document["reminderSource"] = hasApiReminder
          ? "api"
          : derivedReminderType
          ? "derived"
          : undefined;

        const reminderActive = hasApiReminder || Boolean(derivedReminderType);

        let reminderMessage: string | null = null;
        if (reminderSource === "api") {
          if (documentExpired) {
            reminderMessage = "Reminder Demplon: dokumen sudah kedaluwarsa.";
          } else if (typeof daysUntilExpire === "number") {
            reminderMessage = `Reminder Demplon: ${daysUntilExpire} hari tersisa sebelum kedaluwarsa.`;
          } else if (item.reminder_info) {
            reminderMessage = "Reminder Demplon aktif untuk dokumen ini.";
          }
        } else if (reminderSource === "derived") {
          if (documentExpired) {
            const overdueDays = daysUntilExpire ? Math.abs(daysUntilExpire) : 0;
            reminderMessage = `Dokumen melewati tanggal kedaluwarsa${
              overdueDays ? ` ${overdueDays} hari` : ""
            }.`;
          } else if (typeof daysUntilExpire === "number") {
            reminderMessage = `Dokumen akan kedaluwarsa dalam ${daysUntilExpire} hari.`;
          }
        }

        return {
          id: String(item.id),
          number: item.number || "",
          title: item.title || "Untitled",
          description: item.description || "",
          documentDate,
          expireDate: expireDateRaw,
          archive: archiveCode,
          archiveName,
          status,
          updatedBy: item.id_user || "system",
          createdBy: item.id_user || "system",
          createdDate: item.date_created || new Date().toISOString(),
          updatedDate: item.last_updated || new Date().toISOString(),
          parentId: String(item.id_archive),
          fileType,
          filesCount,
          contributors: contributorList,
          notification: item.notification ?? false,
          completion: item.completion ?? false,
          isStarred: false,
          lastAccessed: undefined,
          content: undefined,
          documentExpired,
          reminderActive,
          reminderType: normalizedReminderType,
          reminderInfo: item.reminder_info ?? false,
          reminderObject: item.reminder_object ?? false,
          reminderLink: item.reminder_link ?? false,
          reminderSource,
          reminderMessage,
          daysUntilExpire,
          expireStatus,
          archiveData: archiveDataForRecovery, // 🔥 NEW: Simpan archive object untuk recovery
        };
      }
    );

    console.log(`✅ Successfully transformed ${documents.length} documents`);
    console.log("Sample document:", documents[0]);

    return {
      documents,
      total: totalDocuments,
      hasMore,
    };
  } catch (error) {
    console.error("❌ Error fetching documents from API:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.log("⚠️ CANNOT LOAD DOCUMENTS - API ERROR");

    // THROW ERROR - Jangan return empty array
    throw error;
  }
}

/**
 * Fetch dokumen terbaru dengan sorting dari Demplon API
 * Endpoint ini mengambil dokumen dengan urutan terbaru (DESC by ID)
 *
 * @param accessToken - Access token dari NextAuth session (optional, handled server-side)
 * @param options - Query options untuk API
 *   - start: number (offset untuk pagination, default 0)
 *   - length: number (jumlah dokumen yang diambil, default 10)
 *   - sort: string[] (field yang akan di-sort, default ['id'])
 *   - sortdir: string[] (arah sorting ASC/DESC, default ['DESC'])
 * @returns Promise<Document[]> - Array dokumen terbaru dari API
 *
 * Contoh penggunaan:
 * ```typescript
 * // Ambil 10 dokumen terbaru
 * const latestDocs = await getLatestDocumentsFromAPI();
 *
 * // Ambil 20 dokumen mulai dari index 10
 * const nextBatch = await getLatestDocumentsFromAPI({ start: 10, length: 20 });
 * ```
 *
 * Response Structure dari API:
 * {
 *   "success": true,
 *   "data": [...],           // Array of DemplonDocumentItem
 *   "recordsTotal": 150,     // Total semua dokumen di database
 *   "recordsFiltered": 150,  // Total dokumen setelah filtering
 *   "draw": 1                // Request sequence number
 * }
 */
export async function getLatestDocumentsFromAPI(
  accessToken?: string | undefined,
  options?: {
    start?: number;
    length?: number;
    sort?: string[];
    sortdir?: string[];
  }
): Promise<Document[]> {
  try {
    console.log("📡 getLatestDocumentsFromAPI() called");

    // Token parameter deprecated - handled server-side via API route
    if (accessToken) {
      console.log(
        "⚠️ Note: accessToken parameter is deprecated and will be ignored"
      );
      console.log("   Session is now handled automatically server-side");
    }

    const start = options?.start || 0;
    const length = options?.length || 10;
    const sort = options?.sort || ["id"];
    const sortdir = options?.sortdir || ["DESC"];

    console.log(`📊 Fetching latest documents with params:`, {
      start,
      length,
      sort,
      sortdir,
    });

    // Build query string dengan array parameters
    const params = new URLSearchParams();
    params.append("start", start.toString());
    params.append("length", length.toString());
    sort.forEach((s) => params.append("sort[]", s));
    sortdir.forEach((d) => params.append("sortdir[]", d));

    // Call API via internal API route
    const url = `/api/demplon/documents/latest?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    console.log("📦 Latest Documents API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Latest Documents API error:", errorData);
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("📦 Latest Documents API response received");
    console.log("   - Success:", result.success);
    console.log("   - Count:", result.data?.length || 0);
    console.log("   - Total Records:", result.recordsTotal);
    console.log("   - Filtered Records:", result.recordsFiltered);

    if (!result.success || !Array.isArray(result.data)) {
      console.error("⚠️ Invalid API response format");
      throw new Error("Invalid API response format");
    }

    const documentsData = result.data;
    console.log(`✅ Got ${documentsData.length} latest documents from API`);

    // Transform data dari API ke format Document internal (gunakan logic yang sama)
    const documents: Document[] = documentsData.map(
      (item: DemplonDocumentItem) => {
        const archiveCode = item.archive?.code || "UNKNOWN";
        const archiveName = item.archive?.name || archiveCode || "Unknown";
        const archiveDataForRecovery = item.archive; // 🔥 NEW: Simpan archive object

        const normalizeDate = (value?: string | null, fallback?: string) => {
          if (!value) {
            return fallback || "";
          }
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) {
            return fallback || "";
          }
          return parsed.toISOString().split("T")[0];
        };

        const documentDate = normalizeDate(
          item.document_date,
          new Date().toISOString().split("T")[0]
        );
        const expireDateRaw = normalizeDate(item.document_expire_date, "");
        const expireDateObject = item.document_expire_date
          ? new Date(item.document_expire_date)
          : null;

        const today = new Date();
        const startOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        let daysUntilExpire: number | null = null;
        if (expireDateObject && !Number.isNaN(expireDateObject.getTime())) {
          const diffMs = expireDateObject.getTime() - startOfToday.getTime();
          daysUntilExpire = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }

        const documentExpired = Boolean(
          item.document_expired ||
            (typeof daysUntilExpire === "number" && daysUntilExpire < 0)
        );

        let expireStatus: Document["expireStatus"] = "noExpire";
        if (expireDateObject && !Number.isNaN(expireDateObject.getTime())) {
          if (documentExpired) {
            expireStatus = "expired";
          } else if (
            typeof daysUntilExpire === "number" &&
            daysUntilExpire <= 30
          ) {
            expireStatus = "expiringSoon";
          } else {
            expireStatus = "active";
          }
        }

        let status = "Active";
        if (documentExpired) {
          status = "Expired";
        } else if (expireStatus === "expiringSoon") {
          status = "Expiring Soon";
        }

        const filesCount = Array.isArray(item.files) ? item.files.length : 0;
        const primaryFile =
          Array.isArray(item.files) && item.files.length > 0
            ? item.files[0]
            : undefined;
        const fileType = primaryFile?.file?.split(".").pop() || "unknown";

        const contributorList: Contributor[] = Array.isArray(item.contributors)
          ? item.contributors
              .map((contributor) => {
                if (contributor && typeof contributor === "object") {
                  const raw = contributor as Record<string, unknown>;
                  const name =
                    typeof raw.name_user === "string"
                      ? raw.name_user
                      : typeof raw.name === "string"
                      ? raw.name
                      : undefined;
                  const role =
                    typeof raw.mode === "string"
                      ? raw.mode
                      : typeof raw.role === "string"
                      ? raw.role
                      : "Member";
                  if (name) {
                    return { name, role } as Contributor;
                  }
                } else if (typeof contributor === "string") {
                  return { name: contributor, role: "Member" } as Contributor;
                }
                return null;
              })
              .filter((entry): entry is Contributor => entry !== null)
          : [];

        const hasApiReminder = Boolean(item.reminder_active ?? item.reminder);
        const derivedReminderType = !hasApiReminder
          ? documentExpired
            ? "error"
            : expireStatus === "expiringSoon"
            ? "warning"
            : undefined
          : undefined;

        const normalizedReminderType =
          item.reminder_type ||
          (hasApiReminder && documentExpired ? "error" : undefined) ||
          derivedReminderType;

        const reminderSource: Document["reminderSource"] = hasApiReminder
          ? "api"
          : derivedReminderType
          ? "derived"
          : undefined;

        const reminderActive = hasApiReminder || Boolean(derivedReminderType);

        let reminderMessage: string | null = null;
        if (reminderSource === "api") {
          if (documentExpired) {
            reminderMessage = "Reminder Demplon: dokumen sudah kedaluwarsa.";
          } else if (typeof daysUntilExpire === "number") {
            reminderMessage = `Reminder Demplon: ${daysUntilExpire} hari tersisa sebelum kedaluwarsa.`;
          } else if (item.reminder_info) {
            reminderMessage = "Reminder Demplon aktif untuk dokumen ini.";
          }
        } else if (reminderSource === "derived") {
          if (documentExpired) {
            const overdueDays = daysUntilExpire ? Math.abs(daysUntilExpire) : 0;
            reminderMessage = `Dokumen melewati tanggal kedaluwarsa${
              overdueDays ? ` ${overdueDays} hari` : ""
            }.`;
          } else if (typeof daysUntilExpire === "number") {
            reminderMessage = `Dokumen akan kedaluwarsa dalam ${daysUntilExpire} hari.`;
          }
        }

        return {
          id: String(item.id),
          number: item.number || "",
          title: item.title || "Untitled",
          description: item.description || "",
          documentDate,
          expireDate: expireDateRaw,
          archive: archiveCode,
          archiveName,
          status,
          updatedBy: item.id_user || "system",
          createdBy: item.id_user || "system",
          createdDate: item.date_created || new Date().toISOString(),
          updatedDate: item.last_updated || new Date().toISOString(),
          parentId: String(item.id_archive),
          fileType,
          filesCount,
          contributors: contributorList,
          notification: item.notification ?? false,
          completion: item.completion ?? false,
          isStarred: false,
          lastAccessed: undefined,
          content: undefined,
          documentExpired,
          reminderActive,
          reminderType: normalizedReminderType,
          reminderInfo: item.reminder_info ?? false,
          reminderObject: item.reminder_object ?? false,
          reminderLink: item.reminder_link ?? false,
          reminderSource,
          reminderMessage,
          daysUntilExpire,
          expireStatus,
          archiveData: archiveDataForRecovery, // 🔥 NEW: Simpan archive object untuk recovery
        };
      }
    );

    console.log(
      `✅ Successfully transformed ${documents.length} latest documents`
    );
    console.log("Sample latest document:", documents[0]);

    return documents;
  } catch (error) {
    console.error("❌ Error fetching latest documents from API:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.log("⚠️ CANNOT LOAD LATEST DOCUMENTS - API ERROR");

    // THROW ERROR - Jangan return empty array
    throw error;
  }
}

/**
 * Fetch archives dalam format Tree (Hierarkis) dari Demplon API
 *
 * Fungsi ini mengambil archives dengan struktur parent-child yang hierarkis.
 * Sangat berguna untuk menampilkan folder tree view atau navigasi hierarkis.
 *
 * @param accessToken - Access token dari NextAuth session (optional, handled server-side)
 * @returns Promise<Archive[]> - Array of archives dengan children (nested structure)
 *
 * Response Structure dari API:
 * [
 *   {
 *     "id": 17,
 *     "code": "TIK",
 *     "name": "Teknologi, Informasi & Komunikasi",
 *     "id_parent": null,
 *     "children": [
 *       {
 *         "id": 146,
 *         "code": "DOKUMENTASIAPLIKASI",
 *         "name": "Dokumentasi Aplikasi",
 *         "id_parent": 17,
 *         "children": []
 *       }
 *     ]
 *   }
 * ]
 *
 * Contoh penggunaan:
 * ```typescript
 * // Ambil archives dalam format tree
 * const archivesTree = await getArchivesTreeFromAPI();
 *
 * // Render sebagai tree view
 * function renderTree(archives) {
 *   return archives.map(archive => (
 *     <TreeNode key={archive.id} label={archive.name}>
 *       {archive.children && renderTree(archive.children)}
 *     </TreeNode>
 *   ));
 * }
 * ```
 */
export async function getArchivesTreeFromAPI(
  accessToken?: string | undefined
): Promise<Archive[]> {
  try {
    console.log("📡 getArchivesTreeFromAPI() called");

    // Token parameter deprecated - handled server-side via API route
    if (accessToken) {
      console.log(
        "⚠️ Note: accessToken parameter is deprecated and will be ignored"
      );
      console.log("   Session is now handled automatically server-side");
    }

    // Call API via internal API route dengan tree parameter
    const response = await fetch("/api/demplon/archives/tree?tree=true", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    console.log("📦 Archives Tree API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ Archives Tree API error:", errorData);
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("📦 Archives Tree API response received");
    console.log("   - Success:", result.success);
    console.log("   - Root Count:", result.rootCount);
    console.log("   - Total Count:", result.totalCount);
    console.log("   - Is Tree:", result.isTree);

    if (!result.success || !Array.isArray(result.data)) {
      console.error("⚠️ Invalid API response format");
      throw new Error("Invalid API response format");
    }

    const archivesTreeData = result.data;
    console.log(`✅ Got ${archivesTreeData.length} root archives from API`);

    // Recursive function untuk transform tree structure
    const transformArchiveTree = (item: DemplanArchiveItem): Archive => {
      const archive: Archive = {
        id: String(item.id),
        name: item.name,
        code: item.code,
        parentId: item.id_parent ? String(item.id_parent) : "root",
        status: "active",
      };

      // Jika ada children, transform recursively
      if (Array.isArray(item.children) && item.children.length > 0) {
        archive.children = item.children.map(transformArchiveTree);
      }

      return archive;
    };

    // Transform semua root archives dan children-nya
    const archivesTree: Archive[] = archivesTreeData.map(transformArchiveTree);

    console.log(
      `✅ Successfully transformed ${archivesTree.length} root archives with tree structure`
    );
    console.log("Sample root archive:", archivesTree[0]);

    return archivesTree;
  } catch (error) {
    console.error("❌ Error fetching archives tree from API:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.log("⚠️ CANNOT LOAD ARCHIVES TREE - API ERROR");

    // THROW ERROR - Jangan return empty array
    throw error;
  }
}

/**
 * 🔥 NEW: Fetch ALL documents dengan pagination otomatis + Progressive Loading
 * Fungsi ini akan terus fetch documents sampai semua data terambil
 * SETIAP PAGE LANGSUNG DI-RETURN KE UI (Progressive Loading)
 *
 * @param accessToken - Access token (optional)
 * @param onProgress - Callback untuk update progress dengan DOCUMENTS (optional)
 * @param onPageLoaded - Callback setiap page berhasil dimuat (untuk progressive UI update)
 * @returns Promise<Document[]> - SEMUA documents dari API
 *
 * Cara kerja:
 * 1. Fetch page 1 (800 documents) → ✅ LANGSUNG call onPageLoaded → UI update
 * 2. Fetch page 2 (800 documents) → ✅ LANGSUNG call onPageLoaded → UI update
 * 3. Fetch page 3 (800 documents) → ✅ LANGSUNG call onPageLoaded → UI update
 * 4. Continue sampai semua data terambil
 * 5. Return semua documents
 *
 * Contoh:
 * ```typescript
 * const allDocs = await getAllDocumentsFromAPI(
 *   undefined,
 *   (progress) => {
 *     console.log(`Progress: ${progress.percentage}%`);
 *   },
 *   (documents) => {
 *     // 🔥 UPDATE UI SETIAP PAGE!
 *     setDocuments(documents);
 *   }
 * );
 * ```
 */

// 🔥 GLOBAL LOCK: Prevent multiple simultaneous API fetches
let isGlobalFetching = false;
let globalFetchPromise: Promise<Document[]> | null = null;

export async function getAllDocumentsFromAPI(
  accessToken?: string | undefined,
  onProgress?: (progress: {
    page: number;
    loaded: number;
    total: number;
    percentage: number;
  }) => void,
  onPageLoaded?: (documents: Document[]) => void // 🔥 NEW: Callback untuk progressive loading
): Promise<Document[]> {
  // 🔥 FIX: Jika sudah ada fetch yang berjalan, tunggu dan return hasilnya
  if (isGlobalFetching && globalFetchPromise) {
    console.log("⚠️ getAllDocumentsFromAPI() - Another fetch in progress, waiting...");
    try {
      const result = await globalFetchPromise;
      console.log("✅ Reusing result from ongoing fetch:", result.length);
      return result;
    } catch (err) {
      console.error("❌ Ongoing fetch failed, will retry:", err);
      // Fall through to start new fetch
    }
  }

  // � Set global lock
  isGlobalFetching = true;
  
  try {
    console.log(
      "�📡 getAllDocumentsFromAPI() - Starting to fetch ALL documents"
    );

    // 🔥 Create promise untuk shared fetch
    globalFetchPromise = (async () => {

    const allDocuments: Document[] = [];
    const PAGE_SIZE = 800; // 🔥 INCREASED: 300 → 800 untuk lebih cepat!
    let currentPage = 1;
    let hasMore = true;
    let totalDocuments = 0;

    while (hasMore) {
      const start = (currentPage - 1) * PAGE_SIZE;
      console.log(
        `📄 Fetching page ${currentPage} (start: ${start}, length: ${PAGE_SIZE})`
      );

      const result = await getDocumentsFromAPI(accessToken, {
        start,
        length: PAGE_SIZE,
        reminder_active: false,
      });

      // Update total di page pertama
      if (currentPage === 1) {
        totalDocuments = result.total;
        console.log(`📊 Total documents in database: ${totalDocuments}`);
      }

      // Gabungkan documents
      allDocuments.push(...result.documents);

      const loadedCount = allDocuments.length;
      const percentage =
        totalDocuments > 0
          ? Math.round((loadedCount / totalDocuments) * 100)
          : 100;

      console.log(
        `✅ Page ${currentPage} fetched: ${result.documents.length} documents`
      );
      console.log(
        `📊 Progress: ${loadedCount}/${totalDocuments} (${percentage}%)`
      );

      // 🔥 NEW: Call onPageLoaded untuk progressive UI update
      // Setiap page berhasil dimuat, langsung update UI
      if (onPageLoaded) {
        console.log(
          `🔄 Progressive Loading: Updating UI with ${loadedCount} documents`
        );
        onPageLoaded([...allDocuments]); // Pass copy of current documents
      }

      // Call progress callback
      if (onProgress) {
        onProgress({
          page: currentPage,
          loaded: loadedCount,
          total: totalDocuments,
          percentage,
        });
      }

      // Check jika masih ada data
      hasMore = result.hasMore;
      currentPage++;

      // Safety check: prevent infinite loop
      if (currentPage > 1000) {
        console.warn("⚠️ Safety limit reached (1000 pages). Stopping...");
        break;
      }
    }

    console.log(`✅ getAllDocumentsFromAPI() COMPLETE!`);
    console.log(`   Total documents fetched: ${allDocuments.length}`);
    console.log(`   Total pages: ${currentPage - 1}`);

    return allDocuments;
    })(); // End of globalFetchPromise async IIFE
    
    // 🔥 Wait for fetch to complete
    const result = await globalFetchPromise;
    return result;
    
  } catch (error) {
    console.error("❌ Error in getAllDocumentsFromAPI:", error);
    throw error;
  } finally {
    // 🔥 Reset global lock setelah selesai
    console.log("🔓 getAllDocumentsFromAPI() - Releasing global lock");
    isGlobalFetching = false;
    globalFetchPromise = null;
  }
}

// getRemindersFromAPI() DIHAPUS - Tidak diperlukan!
// Reminder sudah otomatis computed dari Documents yang punya expire date
// Lihat di page.tsx: dynamicReminders computed dari documents.filter(expireDate)
// UI: AllRemindersModal sudah menampilkan dari data documents yang ada

// Empty array for backward compatibility (will be replaced with API data)
export const allDocuments: Document[] = [];

export const expireInOptions = [
  { id: "1w", label: "In 1 Week" },
  { id: "2w", label: "In 2 Weeks" },
  { id: "1m", label: "In 1 Month" },
  { id: "3m", label: "In 3 Months" },
  { id: "6m", label: "In 6 Months" },
  { id: "expired", label: "Already Expired" },
];
