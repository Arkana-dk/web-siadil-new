import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Document } from "../types";
import { getDocumentsFromAPI } from "../data";
import { getAccessTokenFromServer } from "@/lib/api";

const SIADIL_DOCUMENTS_KEY = "siadil_documents_storage";
const SIADIL_DOCUMENTS_FETCHED_KEY = "siadil_documents_fetched";

export function usePersistentDocuments(): [
  Document[],
  React.Dispatch<React.SetStateAction<Document[]>>,
  { isLoading: boolean; error: Error | null }
] {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        console.log("🔄 usePersistentDocuments - Starting load...");
        console.log("🔑 Session available:", !!session);
        console.log(
          "🔑 Session Access token:",
          session?.accessToken ? "YES ✅" : "NO ❌"
        );

        // Tunggu sampai session ada (user sudah login)
        if (session) {
          console.log("📡 Fetching documents from API...");

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

          // Fetch documents WITH REMINDERS from Demplon (dokumen yang ada expire date)
          const remindersDocuments = await getDocumentsFromAPI(accessToken, {
            length: 1000, // Ambil banyak dokumen reminder
            reminder_active: true, // ✅ TRUE = Hanya dokumen dengan reminder/expire date
          });

          // Fetch ALL documents (untuk menampilkan total documents)
          const allDocuments = await getDocumentsFromAPI(accessToken, {
            length: 1000, // Ambil dokumen biasa
            reminder_active: false, // FALSE = Semua dokumen
          });

          console.log(`📊 Documents Summary:`);
          console.log(`   - Reminder documents: ${remindersDocuments.length}`);
          console.log(`   - All documents: ${allDocuments.length}`);

          // Merge: Gabungkan reminders docs + all docs (deduplicate by ID)
          const docMap = new Map();
          // Prioritaskan reminders docs karena punya expire date
          remindersDocuments.forEach((doc) => docMap.set(doc.id, doc));
          // Tambahkan docs yang belum ada
          allDocuments.forEach((doc) => {
            if (!docMap.has(doc.id)) {
              docMap.set(doc.id, doc);
            }
          });

          const apiDocuments = Array.from(docMap.values());
          console.log(`   - Total unique documents: ${apiDocuments.length}`);

          console.log("📦 API Response received:");
          console.log("   - Total unique documents:", apiDocuments.length);
          console.log("   - First document:", apiDocuments[0]);

          // 🔍 DEBUG: Cek berapa dokumen yang punya expireDate
          const docsWithExpireDate = apiDocuments.filter(
            (d) => d.expireDate && d.expireDate !== ""
          );
          console.log(
            "   - Documents with expireDate:",
            docsWithExpireDate.length
          );
          if (docsWithExpireDate.length > 0) {
            console.log("   - ✅ Sample doc with expire:", {
              id: docsWithExpireDate[0].id,
              title: docsWithExpireDate[0].title,
              expireDate: docsWithExpireDate[0].expireDate,
              expired: docsWithExpireDate[0].documentExpired,
            });
          } else {
            console.warn("   ⚠️ NO DOCUMENTS HAVE EXPIRE DATE!");
          }

          // Merge dengan localStorage untuk preserve isStarred dan lastAccessed
          const storedDocuments = localStorage.getItem(SIADIL_DOCUMENTS_KEY);
          if (storedDocuments) {
            try {
              const localDocs: Document[] = JSON.parse(storedDocuments);
              const localDocsMap = new Map(localDocs.map((d) => [d.id, d]));

              // Merge: gunakan data API tapi preserve isStarred & lastAccessed dari localStorage
              const mergedDocuments = apiDocuments.map((apiDoc) => {
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

              setDocuments(mergedDocuments);
              localStorage.setItem(
                SIADIL_DOCUMENTS_KEY,
                JSON.stringify(mergedDocuments)
              );
            } catch {
              console.warn(
                "⚠️ Failed to parse localStorage, using API data only"
              );
              setDocuments(apiDocuments);
              localStorage.setItem(
                SIADIL_DOCUMENTS_KEY,
                JSON.stringify(apiDocuments)
              );
            }
          } else {
            setDocuments(apiDocuments);
            localStorage.setItem(
              SIADIL_DOCUMENTS_KEY,
              JSON.stringify(apiDocuments)
            );
          }

          localStorage.setItem(SIADIL_DOCUMENTS_FETCHED_KEY, "true");

          console.log(
            `✅ Documents loaded and set to state (${apiDocuments.length} items)`
          );
          setIsLoading(false);
        } else {
          console.log("⏳ No session yet, waiting for login...");
          console.log("   - Documents will be loaded after login");
          setDocuments([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error loading documents:", error);
        if (error instanceof Error) {
          console.error("   - Error message:", error.message);
          console.error("   - Error stack:", error.stack);
          setError(error);
        } else {
          setError(new Error("Unknown error occurred"));
        }
        console.log("⚠️ Documents cannot be loaded - API error");
        setDocuments([]);
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, [session]);

  // Save to localStorage whenever documents change (preserve user interactions)
  useEffect(() => {
    if (!isLoading && documents.length > 0) {
      try {
        localStorage.setItem(SIADIL_DOCUMENTS_KEY, JSON.stringify(documents));
      } catch (error) {
        console.error("❌ Failed to save documents to localStorage:", error);
      }
    }
  }, [documents, isLoading]);

  return [documents, setDocuments, { isLoading, error }];
}
