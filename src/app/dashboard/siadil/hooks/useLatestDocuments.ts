import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Document } from "../types";
import { getLatestDocumentsFromAPI } from "../data";

/**
 * Custom Hook untuk mengambil Dokumen Terbaru dari Demplon API
 *
 * Hook ini menggunakan endpoint dengan sorting (DESC by ID) untuk
 * mendapatkan dokumen-dokumen terbaru yang baru saja ditambahkan.
 *
 * @param options - Opsi untuk fetching dokumen
 *   - start: number (offset pagination, default 0)
 *   - length: number (jumlah dokumen yang diambil, default 10)
 *   - autoFetch: boolean (auto fetch saat component mount, default true)
 *
 * @returns [documents, refetch, { isLoading, error }]
 *
 * Contoh penggunaan:
 * ```typescript
 * // Di dalam component
 * const [latestDocs, refetch, { isLoading, error }] = useLatestDocuments({
 *   length: 10,
 * });
 *
 * // Manual refetch
 * const handleRefresh = () => {
 *   refetch();
 * };
 * ```
 */
export function useLatestDocuments(options?: {
  start?: number;
  length?: number;
  autoFetch?: boolean;
}): [
  Document[],
  () => Promise<void>,
  { isLoading: boolean; error: Error | null }
] {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const start = options?.start || 0;
  const length = options?.length || 10;
  const autoFetch = options?.autoFetch !== false; // Default true

  // Fungsi untuk fetch dokumen terbaru
  const fetchLatestDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 useLatestDocuments - Starting fetch...");
      console.log("🔑 Session available:", !!session);

      // Tunggu sampai session ada (user sudah login)
      if (!session) {
        console.log("⏳ No session yet, waiting for login...");
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      console.log("📡 Fetching latest documents from API...");
      console.log("📊 Params:", { start, length });

      // Fetch dokumen terbaru dengan sorting DESC by ID
      const latestDocs = await getLatestDocumentsFromAPI(undefined, {
        start,
        length,
        sort: ["id"],
        sortdir: ["DESC"],
      });

      console.log("📦 API Response received:");
      console.log("   - Total latest documents:", latestDocs.length);
      console.log("   - First document:", latestDocs[0]);

      setDocuments(latestDocs);
      console.log(
        `✅ Latest documents loaded and set to state (${latestDocs.length} items)`
      );
    } catch (err) {
      console.error("❌ Error loading latest documents:", err);
      if (err instanceof Error) {
        console.error("   - Error message:", err.message);
        console.error("   - Error stack:", err.stack);
        setError(err);
      } else {
        setError(new Error("Unknown error occurred"));
      }
      console.log("⚠️ Latest documents cannot be loaded - API error");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto fetch saat component mount atau session berubah
  useEffect(() => {
    if (autoFetch) {
      fetchLatestDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, autoFetch]);

  // Return documents, refetch function, dan state
  return [documents, fetchLatestDocuments, { isLoading, error }];
}
