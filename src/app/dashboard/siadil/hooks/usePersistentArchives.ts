import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Archive } from "../types";
import { getArchivesFromAPI } from "../data";
import { getAccessTokenFromServer } from "@/lib/api";

const SIADIL_ARCHIVES_KEY = "siadil_archives_storage";
const SIADIL_ARCHIVES_FETCHED_KEY = "siadil_archives_fetched";

export function usePersistentArchives(): [
  Archive[],
  React.Dispatch<React.SetStateAction<Archive[]>>,
  { isLoading: boolean; error: Error | null }
] {
  const { data: session } = useSession();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadArchives() {
      try {
        console.log("🔄 usePersistentArchives - Starting load...");
        console.log("🔑 Session available:", !!session);
        console.log(
          "🔑 Session Access token:",
          session?.accessToken ? "YES ✅" : "NO ❌"
        );

        // Tunggu sampai session ada (user sudah login)
        if (session) {
          console.log("📡 Fetching archives from API...");

          // 🔥 NEW: Fetch token dari server-side API route
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
            setArchives([]);
            setIsLoading(false);
            return;
          }

          console.log("🔑 Using token:", accessToken.substring(0, 30) + "...");
          console.log("🌐 API will be called with token");

          // 🔥 ALWAYS use Flat API - lebih reliable dan complete
          console.log(
            "📁 Fetching ALL archives from Flat API (includes all sub-archives)..."
          );
          let apiArchives: Archive[];

          try {
            // Flat API mengembalikan SEMUA archives (parent + children) dalam single array
            // Format: [{id: 17, id_parent: null}, {id: 146, id_parent: 17}, ...]
            apiArchives = await getArchivesFromAPI(accessToken);

            console.log("✅ Flat Archives API loaded successfully!");
            console.log(
              "   - Total archives (including sub-archives):",
              apiArchives.length
            );

            // Analyze hierarchy
            const roots = apiArchives.filter((a) => a.parentId === "root");
            const children = apiArchives.filter((a) => a.parentId !== "root");

            console.log("   - Root archives:", roots.length);
            console.log("   - Sub-archives (children):", children.length);

            // Log breakdown by parent
            console.log("\n📊 Archives Breakdown:");
            roots.forEach((root) => {
              const rootChildren = apiArchives.filter(
                (a) => a.parentId === root.id
              );
              console.log(
                `   ${root.code}: ${rootChildren.length} sub-archive(s)`
              );

              // Log sub-archives
              if (rootChildren.length > 0) {
                rootChildren.forEach((child) => {
                  const grandchildren = apiArchives.filter(
                    (a) => a.parentId === child.id
                  );
                  const icon = grandchildren.length > 0 ? "📂" : "📄";
                  console.log(`      ${icon} ${child.code} - ${child.name}`);
                });
              }
            });
          } catch (error) {
            console.error("❌ Failed to fetch archives from Flat API");
            throw error;
          }

          console.log("📦 API Response received:");
          console.log("   - Total archives:", apiArchives.length);
          console.log("   - First archive:", apiArchives[0]);
          console.log(
            "   - Archive codes:",
            apiArchives.map((a) => a.code).join(", ")
          );

          setArchives(apiArchives);

          localStorage.setItem(
            SIADIL_ARCHIVES_KEY,
            JSON.stringify(apiArchives)
          );
          localStorage.setItem(SIADIL_ARCHIVES_FETCHED_KEY, "true");

          console.log(
            `✅ Archives loaded and set to state (${apiArchives.length} items)`
          );
          setIsLoading(false);
        } else {
          console.log("⏳ No session yet, waiting for login...");
          console.log("   - Archives will be loaded after login");
          setArchives([]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Error loading archives:", error);
        if (error instanceof Error) {
          console.error("   - Error message:", error.message);
          console.error("   - Error stack:", error.stack);
          setError(error);
        } else {
          setError(new Error("Unknown error occurred"));
        }
        console.log("⚠️ Archives cannot be loaded - API error");
        setArchives([]);
        setIsLoading(false);
      }
    }

    loadArchives();
  }, [session]);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SIADIL_ARCHIVES_KEY, JSON.stringify(archives));
      } catch (error) {
        console.error("❌ Failed to save archives to localStorage:", error);
      }
    }
  }, [archives, isLoading]);

  return [archives, setArchives, { isLoading, error }];
}
