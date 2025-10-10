/**
 * API Utility Functions
 * Fungsi helper untuk melakukan request ke API dengan authorization
 */

/**
 * Fetch access token dari server-side API route
 * Ini adalah solusi untuk session cookie chunking issue
 */
export async function getAccessTokenFromServer(): Promise<string | null> {
  try {
    console.log("🔑 Fetching token from /api/auth/token...");
    const response = await fetch("/api/auth/token");

    if (!response.ok) {
      console.error("❌ Token fetch failed:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("✅ Token fetched successfully");
    return data.accessToken || null;
  } catch (error) {
    console.error("❌ Error fetching token:", error);
    return null;
  }
}

// Base URL untuk SSO/Auth API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sso.pupuk-kujang.co.id";

// Base URL untuk Demplon Admin API (untuk archives, documents, dll)
const DEMPLON_API_BASE_URL =
  process.env.NEXT_PUBLIC_DEMPLON_API_URL ||
  "https://demplon.pupuk-kujang.co.id/admin/api";

/**
 * Generic API request helper dengan automatic token injection
 * @param endpoint - API endpoint path (contoh: "/documents", "/archives")
 * @param accessToken - Access token dari session
 * @param options - Fetch options (method, body, headers, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Tambahkan Authorization header jika ada access token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

/**
 * GET request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiGet<T = any>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T> {
  return apiRequest<T>(endpoint, accessToken, {
    method: "GET",
  });
}

/**
 * POST request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPost<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<T> {
  return apiRequest<T>(endpoint, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiPut<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<T> {
  return apiRequest<T>(endpoint, accessToken, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiDelete<T = any>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T> {
  return apiRequest<T>(endpoint, accessToken, {
    method: "DELETE",
  });
}

/**
 * Upload file dengan FormData
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiUploadFile<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  formData: FormData
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {};

  // Tambahkan Authorization header jika ada access token
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData, // FormData tidak perlu Content-Type header
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Upload Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}

// ============================================
// DEMPLON API FUNCTIONS
// ============================================

/**
 * Generic Demplon API request helper dengan automatic token & cookies injection
 * Fungsi ini khusus untuk API Demplon yang memerlukan authorization header dan cookies
 * @param endpoint - API endpoint path (contoh: "/siadil/archives", "/siadil/documents")
 * @param accessToken - Access token dari session untuk Authorization header
 * @param options - Fetch options (method, body, headers, etc.)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demplanApiRequest<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  options: RequestInit = {}
): Promise<T> {
  // Build full URL dengan Demplon base
  const url = `${DEMPLON_API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Tambahkan Authorization header jika ada access token
  // Format: Bearer <token>
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    console.log("🔌 Demplon API Request:", url);
    console.log("🔑 Using token:", accessToken ? "YES ✅" : "NO ❌");

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // PENTING: Kirim cookies otomatis (untuk session, CSRF, etc)
    });

    console.log("📦 Response status:", response.status, response.statusText);

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ API Error:", errorData);
      throw new Error(
        errorData.message ||
          `Demplon API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Response received successfully");
    return data;
  } catch (error) {
    console.error("❌ Demplon API Request Error:", error);
    throw error;
  }
}

/**
 * GET request ke Demplon API
 * Digunakan untuk mengambil data dari Demplon (archives, documents, dll)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demplanApiGet<T = any>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T> {
  return demplanApiRequest<T>(endpoint, accessToken, {
    method: "GET",
  });
}

/**
 * POST request ke Demplon API
 * Digunakan untuk membuat data baru di Demplon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demplanApiPost<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<T> {
  return demplanApiRequest<T>(endpoint, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request ke Demplon API
 * Digunakan untuk update data di Demplon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demplanApiPut<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): Promise<T> {
  return demplanApiRequest<T>(endpoint, accessToken, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request ke Demplon API
 * Digunakan untuk menghapus data di Demplon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function demplanApiDelete<T = any>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T> {
  return demplanApiRequest<T>(endpoint, accessToken, {
    method: "DELETE",
  });
}

// ============================================
// SPECIFIC API FUNCTIONS
// ============================================

/**
 * Fetch Archives dari Demplon API melalui Next.js API Route
 *
 * PENTING: Menggunakan API Route sebagai PROXY untuk menghindari CORS error!
 *
 * Flow:
 * 1. Browser → /api/demplon/archives (Next.js API Route - same origin, no CORS)
 * 2. API Route → Demplon API (server-side, no CORS restrictions)
 * 3. API Route → Browser (return data)
 *
 * Endpoint Internal: GET /api/demplon/archives
 * Endpoint Demplon: GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
 *
 * Authorization: Otomatis dari NextAuth session (tidak perlu accessToken parameter)
 *
 * @param accessToken - DEPRECATED: Not used anymore, kept for backward compatibility
 * @returns Promise<DemplanArchiveItem[]> - Direct array of archives (bukan object wrapper)
 *
 * Response format (DIRECT ARRAY):
 * [
 *   {
 *     id: 17,
 *     slug: "bmuz-tik-teknologi-informasi-komunikasi",
 *     code: "TIK",
 *     name: "Teknologi, Informasi & Komunikasi",
 *     description: "Teknologi, Informasi & Komunikasi",
 *     id_parent: null,
 *     parent: null,
 *     contributors: [...]
 *   },
 *   { id: 41, ... },
 *   ...
 * ]
 *
 * @example
 * ```typescript
 * import { fetchArchives } from "@/lib/api";
 *
 * // No need for session/token, handled automatically server-side
 * const archives = await fetchArchives();
 * console.log(archives); // Direct array
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchArchives(_accessToken?: string | undefined) {
  // Use Next.js API Route as proxy to avoid CORS
  // _accessToken parameter deprecated but kept for backward compatibility
  try {
    console.log("📡 fetchArchives: Calling internal API route...");

    const response = await fetch("/api/demplon/archives", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for NextAuth session
      cache: "no-store", // Don't cache untuk data realtime
    });

    console.log("📦 fetchArchives: Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ fetchArchives: API Error:", errorData);
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    // API route returns { success: true, data: [...] }
    if (result.success && Array.isArray(result.data)) {
      console.log(`✅ fetchArchives: Got ${result.data.length} archives`);
      return result.data;
    }

    // Fallback if format unexpected
    console.warn("⚠️ fetchArchives: Unexpected response format");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("❌ fetchArchives: Error:", error);
    throw error;
  }
}

// ============================================
// CONTOH PENGGUNAAN:
// ============================================

/**
 * Example: Fetch documents dari API
 *
 * const { data: session } = useSession();
 * const accessToken = session?.accessToken;
 *
 * try {
 *   const documents = await apiGet("/api/documents", accessToken);
 *   console.log("Documents:", documents);
 * } catch (error) {
 *   console.error("Failed to fetch documents:", error);
 * }
 */

/**
 * Example: Create new document
 *
 * const newDocument = {
 *   title: "Document Title",
 *   description: "Document Description",
 *   archiveId: "archive-123"
 * };
 *
 * try {
 *   const result = await apiPost("/api/documents", accessToken, newDocument);
 *   console.log("Document created:", result);
 * } catch (error) {
 *   console.error("Failed to create document:", error);
 * }
 */

/**
 * Example: Upload file
 *
 * const formData = new FormData();
 * formData.append("file", fileInput.files[0]);
 * formData.append("title", "My Document");
 * formData.append("archiveId", "archive-123");
 *
 * try {
 *   const result = await apiUploadFile("/api/documents/upload", accessToken, formData);
 *   console.log("File uploaded:", result);
 * } catch (error) {
 *   console.error("Failed to upload file:", error);
 * }
 */
