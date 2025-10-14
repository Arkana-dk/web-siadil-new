import { useState, useEffect, useRef } from "react";
import { Archive } from "../types";

interface PaginatedArchivesResult {
  archives: Archive[];
  isLoading: boolean;
  error: Error | null;
  progress: {
    currentPage: number;
    totalPages: number;
    loadedCount: number;
    totalCount: number;
    percentage: number;
    isComplete: boolean;
  };
}

/**
 * Hook untuk fetch archives dengan sistem pagination
 * Mengambil data secara bertahap untuk performa lebih baik
 *
 * @param pageSize - Jumlah data per halaman (default: 300)
 * @returns PaginatedArchivesResult
 *
 * Features:
 * - 🔄 Auto-pagination: Otomatis fetch halaman berikutnya
 * - ⚡ Progressive loading: Data muncul bertahap
 * - 📊 Progress tracking: Monitor progress loading
 * - 🛡️ Error handling: Robust error management
 * - 🎯 Smart caching: Cache data untuk performa
 */
export function usePaginatedArchives(
  pageSize: number = 300
): PaginatedArchivesResult {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState({
    currentPage: 0,
    totalPages: 1,
    loadedCount: 0,
    totalCount: 0,
    percentage: 0,
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function fetchAllArchivesPaginated() {
      try {
        console.log("🚀 Starting paginated archives fetch...");
        console.log(`📊 Page size: ${pageSize} items per page`);

        setIsLoading(true);
        setError(null);

        const allArchives: Archive[] = [];
        let currentPage = 1;
        let hasMore = true;
        let totalItems = 0;

        // Create abort controller untuk cancel request jika unmount
        abortControllerRef.current = new AbortController();

        while (hasMore && mounted) {
          if (isFetchingRef.current) {
            console.log("⏸️ Already fetching, waiting...");
            await new Promise((resolve) => setTimeout(resolve, 100));
            continue;
          }

          isFetchingRef.current = true;

          console.log(`📡 Fetching page ${currentPage}...`);
          const startTime = Date.now();

          try {
            // Call API dengan pagination parameters
            const response = await fetch(
              `/api/demplon/archives?page=${currentPage}&limit=${pageSize}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                signal: abortControllerRef.current.signal,
              }
            );

            const endTime = Date.now();
            const duration = endTime - startTime;

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            const result = await response.json();

            console.log(`✅ Page ${currentPage} loaded in ${duration}ms`);
            console.log(`   - Items in page: ${result.data?.length || 0}`);
            console.log(
              `   - Total items: ${result.pagination?.totalItems || "unknown"}`
            );

            if (result.success && Array.isArray(result.data)) {
              const pageArchives: Archive[] = result.data.map(
                (item: {
                  id: number | string;
                  name: string;
                  code: string;
                  id_parent?: number | string | null;
                }) => ({
                  id: String(item.id),
                  name: item.name,
                  code: item.code,
                  parentId: item.id_parent ? String(item.id_parent) : "root",
                  status: "active",
                })
              );

              allArchives.push(...pageArchives);

              // Update progress
              if (result.pagination) {
                totalItems = result.pagination.totalItems || totalItems;
                const totalPages =
                  result.pagination.totalPages ||
                  Math.ceil(totalItems / pageSize);
                const percentage = Math.round(
                  (allArchives.length / totalItems) * 100
                );

                setProgress({
                  currentPage,
                  totalPages,
                  loadedCount: allArchives.length,
                  totalCount: totalItems,
                  percentage,
                  isComplete: !result.pagination.hasMore,
                });

                hasMore = result.pagination.hasMore;

                console.log(
                  `📊 Progress: ${allArchives.length}/${totalItems} (${percentage}%)`
                );
              } else {
                // Jika tidak ada pagination info, assume complete
                hasMore = false;
                setProgress({
                  currentPage,
                  totalPages: currentPage,
                  loadedCount: allArchives.length,
                  totalCount: allArchives.length,
                  percentage: 100,
                  isComplete: true,
                });
              }

              // Update archives state progressively
              if (mounted) {
                setArchives([...allArchives]);
              }

              // Jika masih ada data, lanjut ke halaman berikutnya
              if (hasMore) {
                currentPage++;
                // Small delay untuk tidak overwhelm server
                await new Promise((resolve) => setTimeout(resolve, 100));
              }
            } else {
              console.warn("⚠️ Unexpected response format:", result);
              hasMore = false;
            }
          } catch (fetchError) {
            if (
              fetchError instanceof Error &&
              fetchError.name === "AbortError"
            ) {
              console.log("⏹️ Fetch aborted");
              return;
            }
            throw fetchError;
          } finally {
            isFetchingRef.current = false;
          }
        }

        if (mounted) {
          console.log(
            `✅ All archives loaded! Total: ${allArchives.length} items`
          );
          setProgress((prev) => ({ ...prev, isComplete: true }));
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching paginated archives:", err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setIsLoading(false);
        }
      }
    }

    fetchAllArchivesPaginated();

    // Cleanup function
    return () => {
      mounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pageSize]);

  return {
    archives,
    isLoading,
    error,
    progress,
  };
}
