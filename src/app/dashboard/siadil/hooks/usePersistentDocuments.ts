import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Document } from "../types";
import { getAllDocumentsFromAPI } from "../data";
import { getAccessTokenFromServer } from "@/lib/api";

const SIADIL_DOCUMENTS_KEY = "siadil_documents_storage";
const SIADIL_DOCUMENTS_FETCHED_KEY = "siadil_documents_fetched";

// 🔥 GLOBAL FLAG: Prevent multiple simultaneous fetches
let isFetchingDocuments = false;
let documentsCache: Document[] | null = null;
let currentFetchId: string | null = null; // Track unique fetch session

export function usePersistentDocuments(): [
  Document[],
  React.Dispatch<React.SetStateAction<Document[]>>,
  {
    isLoading: boolean;
    error: Error | null;
    loadingProgress: {
      loaded: number;
      total: number;
      percentage: number;
    } | null;
  }
] {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<{
    loaded: number;
    total: number;
    percentage: number;
  } | null>(null);

  // 🔥 FIX: Prevent double fetch dengan useRef + unique fetch ID
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 🔥 Generate unique fetch ID untuk session ini
    const fetchId = `fetch_${Date.now()}_${Math.random()}`;
    isMountedRef.current = true;
    console.log(`🆔 New fetch session: ${fetchId}`);

    async function loadDocuments() {
      try {
        console.log("🔄 usePersistentDocuments - Starting load...");
        console.log("🔑 Session available:", !!session);
        console.log(
          "🔑 Session Access token:",
          session?.accessToken ? "YES ✅" : "NO ❌"
        );

        // 🔥 FIX: Cek jika sedang fetching DAN fetch ID sama (duplicate)
        if (isFetchingDocuments && currentFetchId === fetchId) {
          console.log(
            "⚠️ Duplicate fetch detected for same session, skipping..."
          );
          setIsLoading(false);
          return;
        }

        // 🔥 FIX: Cek jika ada fetch lain yang sedang berjalan
        if (isFetchingDocuments && currentFetchId !== fetchId) {
          console.log(
            "⚠️ Another fetch in progress, using cache if available..."
          );
          if (documentsCache && documentsCache.length > 0) {
            console.log("✅ Using cached documents:", documentsCache.length);
            setDocuments(documentsCache);
            setIsLoading(false);
            return;
          }
          // Tunggu sebentar dan retry
          console.log("⏳ Waiting for ongoing fetch to complete...");
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (documentsCache && documentsCache.length > 0) {
            console.log("✅ Cache ready after wait:", documentsCache.length);
            setDocuments(documentsCache);
            setIsLoading(false);
            return;
          }
        }

        // 🔥 FIX: Jika ada cache yang masih fresh (< 5 menit), gunakan cache
        if (documentsCache && documentsCache.length > 0) {
          console.log("✅ Using cached documents:", documentsCache.length);
          setDocuments(documentsCache);
          setIsLoading(false);
          return;
        }

        // Tunggu sampai session ada (user sudah login)
        if (session) {
          console.log("📡 Fetching documents from API...");

          // 🔥 Set flag: sedang fetching dengan ID unik
          isFetchingDocuments = true;
          currentFetchId = fetchId;

          // 🔥 Create abort controller untuk cancel jika unmount
          abortControllerRef.current = new AbortController();

          // Fetch token dari server-side API route
          console.log("🔑 Trying to get token from server API...");
          const tokenFromServer = await getAccessTokenFromServer();

          console.log(
            "🔑 Token from server API:",
            tokenFromServer ? "EXISTS ✅" : "NULL ❌"
          );

          // Gunakan token dari server, fallback ke session token
          const accessToken = tokenFromServer || session.accessToken;

          if (!accessToken) {
            console.error("❌ No access token available");
            setDocuments([]);
            setIsLoading(false);
            return;
          }

          console.log("🔑 Using token:", accessToken.substring(0, 30) + "...");
          console.log("🌐 API will be called with token");
          console.log(
            "🔄 Using PAGINATION system to fetch ALL documents (800 per page)..."
          );
          console.log(
            "✨ Progressive Loading ENABLED - Data akan langsung tampil setiap page!"
          );

          // 🔥 NEW: Fetch ALL documents with pagination (800 per page) + PROGRESSIVE LOADING
          const apiDocuments = await getAllDocumentsFromAPI(
            accessToken,
            // Progress callback
            (progress) => {
              // 🔥 FIX: Only update progress if component still mounted
              if (!isMountedRef.current) {
                console.log("⚠️ Component unmounted, skipping progress update");
                return;
              }

              console.log(
                `📊 Loading progress: Page ${progress.page} - ${progress.loaded}/${progress.total} (${progress.percentage}%)`
              );
              setLoadingProgress({
                loaded: progress.loaded,
                total: progress.total,
                percentage: progress.percentage,
              });
            },
            // 🔥 NEW: Progressive loading callback - UPDATE UI SETIAP PAGE!
            (currentDocuments) => {
              // 🔥 FIX: Only update UI if component still mounted
              if (!isMountedRef.current) {
                console.log(
                  "⚠️ Component unmounted, skipping progressive UI update"
                );
                return;
              }

              console.log(
                `✨ Progressive Loading: Updating UI with ${currentDocuments.length} documents`
              );

              // 🔥 FIX: JANGAN save ke localStorage setiap update!
              // Hanya update UI state, save localStorage nanti di akhir saja

              // Merge dengan localStorage untuk preserve isStarred & lastAccessed (read only)
              const storedDocuments =
                localStorage.getItem(SIADIL_DOCUMENTS_KEY);
              if (storedDocuments) {
                try {
                  const localDocs: Document[] = JSON.parse(storedDocuments);
                  const localDocsMap = new Map(localDocs.map((d) => [d.id, d]));

                  // Merge: gunakan data API tapi preserve isStarred & lastAccessed
                  const mergedDocuments = currentDocuments.map((apiDoc) => {
                    const localDoc = localDocsMap.get(apiDoc.id);
                    if (localDoc) {
                      return {
                        ...apiDoc,
                        isStarred: localDoc.isStarred || false,
                        lastAccessed: localDoc.lastAccessed,
                      };
                    }
                    return apiDoc;
                  });

                  // 🔥 UPDATE UI LANGSUNG (tanpa save localStorage!)
                  setDocuments(mergedDocuments);
                  documentsCache = mergedDocuments;
                } catch {
                  console.warn(
                    "⚠️ Failed to parse localStorage for progressive update"
                  );
                  setDocuments(currentDocuments);
                  documentsCache = currentDocuments;
                }
              } else {
                // 🔥 UPDATE UI LANGSUNG (tanpa save localStorage!)
                setDocuments(currentDocuments);
                documentsCache = currentDocuments;
              }
            }
          );

          // 🔥 FIX: Cek jika component sudah unmounted
          if (!isMountedRef.current) {
            console.log("⚠️ Component unmounted during fetch, aborting...");
            isFetchingDocuments = false;
            return;
          }

          console.log(`📊 Documents Summary:`);
          console.log(`   - Total documents fetched: ${apiDocuments.length}`);

          // 🔥 FIX: Simpan ke cache
          documentsCache = apiDocuments;

          // 🔍 DEBUG: Cek berapa dokumen yang punya expireDate
          const docsWithExpireDate = apiDocuments.filter(
            (d) => d.expireDate && d.expireDate !== ""
          );
          const docsExpired = apiDocuments.filter((d) => d.documentExpired);
          const docsExpiringSoon = apiDocuments.filter(
            (d) =>
              !d.documentExpired &&
              d.daysUntilExpire !== null &&
              d.daysUntilExpire !== undefined &&
              d.daysUntilExpire <= 30 &&
              d.daysUntilExpire >= 0
          );

          console.log(
            "   - Documents with expireDate:",
            docsWithExpireDate.length,
            `(${(
              (docsWithExpireDate.length / apiDocuments.length) *
              100
            ).toFixed(1)}%)`
          );
          console.log("   - Documents expired:", docsExpired.length);
          console.log(
            "   - Documents expiring soon (<=30 days):",
            docsExpiringSoon.length
          );

          if (docsWithExpireDate.length > 0) {
            console.log("   - ✅ Sample docs with expire:");
            docsWithExpireDate.slice(0, 3).forEach((doc, idx) => {
              console.log(
                `      ${idx + 1}. "${doc.title?.substring(0, 40)}" → Expire: ${
                  doc.expireDate
                }, Expired: ${doc.documentExpired}, Days: ${
                  doc.daysUntilExpire
                }`
              );
            });
          } else {
            console.warn("   ⚠️⚠️⚠️ NO DOCUMENTS HAVE EXPIRE DATE! ⚠️⚠️⚠️");
            console.warn(
              "   This means API didn't return document_expire_date field"
            );
            console.warn("   OR all documents have NULL/empty expire dates");
            console.warn("   Sample document structure:");
            if (apiDocuments.length > 0) {
              console.log("   Fields:", Object.keys(apiDocuments[0]));
            }
          }

          // 🔥 Progressive loading sudah update UI setiap page
          // Di sini hanya perlu save final state ke localStorage (SEKALI SAJA!)
          const currentDocs = documents.length > 0 ? documents : apiDocuments;

          // 🔥 FIX: Save to localStorage dengan error handling untuk quota exceeded
          try {
            // Simpan hanya essential data untuk mengurangi size
            const essentialDocs = currentDocs.map((doc) => ({
              id: doc.id,
              isStarred: doc.isStarred,
              lastAccessed: doc.lastAccessed,
            }));

            // Save essential data saja (lebih kecil)
            localStorage.setItem(
              SIADIL_DOCUMENTS_KEY,
              JSON.stringify(essentialDocs)
            );
            localStorage.setItem(SIADIL_DOCUMENTS_FETCHED_KEY, "true");
            console.log(
              `💾 Saved ${essentialDocs.length} documents metadata to localStorage`
            );
          } catch {
            // 🔥 Handle localStorage quota exceeded
            console.warn(
              "⚠️ Failed to save to localStorage (quota exceeded or full)"
            );
            console.warn("   Data will be fetched from API on next load");

            // Try to clear old data and save again
            try {
              console.log("🧹 Clearing old localStorage data...");
              localStorage.removeItem(SIADIL_DOCUMENTS_KEY);
              localStorage.removeItem(SIADIL_DOCUMENTS_FETCHED_KEY);

              // Try minimal save
              const minimalDocs = currentDocs.map((doc) => ({
                id: doc.id,
                isStarred: doc.isStarred || false,
              }));
              localStorage.setItem(
                SIADIL_DOCUMENTS_KEY,
                JSON.stringify(minimalDocs)
              );
              console.log("✅ Saved minimal documents metadata after cleanup");
            } catch {
              console.warn("❌ Still cannot save to localStorage, skipping...");
              // Tidak masalah, data tetap ada di memory (documents state)
            }
          }

          console.log(
            `✅ ALL Documents loaded complete! Total: ${apiDocuments.length} items`
          );
          console.log(`✨ UI updated progressively during loading`);

          // 🔥 FIX: Reset flag setelah selesai
          console.log(`✅ Fetch ${fetchId} completed successfully`);
          isFetchingDocuments = false;
          currentFetchId = null;
          setIsLoading(false);
        } else {
          console.log("⏳ No session yet, waiting for login...");
          console.log("   - Documents will be loaded after login");
          setDocuments([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error loading documents:", error);

        // 🔥 IMPORTANT: Set error yang lebih informatif
        let errorMessage = "Unknown error occurred";
        if (error instanceof Error) {
          console.error("   - Error message:", error.message);
          console.error("   - Error stack:", error.stack);
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        // Cek apakah error karena network/fetch
        if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("Failed to fetch")
        ) {
          errorMessage =
            "fetch failed - Please check your internet connection or API configuration";
        }

        setError(new Error(errorMessage));
        console.log("⚠️ Documents cannot be loaded - API error");

        // 🔥 FIX: Reset flags on error
        console.log(`❌ Fetch ${fetchId} failed, resetting flags`);
        isFetchingDocuments = false;
        currentFetchId = null;
        documentsCache = null;

        setDocuments([]);
        setIsLoading(false);
      }
    }

    loadDocuments();

    // 🔥 FIX: Cleanup function - CANCEL ongoing fetch dan reset flags
    return () => {
      console.log(`🧹 usePersistentDocuments - Cleanup for fetch ${fetchId}`);
      isMountedRef.current = false;

      // Cancel ongoing API request jika ada
      if (abortControllerRef.current) {
        console.log("🛑 Aborting ongoing API request...");
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Reset global flags hanya jika ini fetch yang aktif
      if (currentFetchId === fetchId) {
        console.log(`🔄 Resetting global flags for fetch ${fetchId}`);
        isFetchingDocuments = false;
        currentFetchId = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]); // Only run when session changes

  // 🔥 OPTIMIZED: Save only essential user data (isStarred, lastAccessed) to localStorage
  // Tidak save full documents untuk avoid quota exceeded
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      try {
        // Simpan hanya data yang dimodifikasi user (isStarred, lastAccessed)
        const essentialData = documents
          .filter((doc) => doc.isStarred || doc.lastAccessed) // Hanya doc yang ada user interaction
          .map((doc) => ({
            id: doc.id,
            isStarred: doc.isStarred,
            lastAccessed: doc.lastAccessed,
          }));

        console.log("💾 [Quick Access] Saving to localStorage:", {
          totalDocs: documents.length,
          withInteraction: essentialData.length,
          withLastAccessed: essentialData.filter((d) => d.lastAccessed).length,
          sample: essentialData.slice(0, 3),
        });

        if (essentialData.length > 0) {
          localStorage.setItem(
            SIADIL_DOCUMENTS_KEY,
            JSON.stringify(essentialData)
          );
          console.log(
            `✅ [Quick Access] Saved ${essentialData.length} user interactions to localStorage`
          );
        }
      } catch (error) {
        console.error(
          "❌ [Quick Access] Failed to save to localStorage:",
          error
        );
        // Tidak masalah, data tetap ada di memory
      }
    }
  }, [documents, isLoading]);

  return [documents, setDocuments, { isLoading, error, loadingProgress }];
}
