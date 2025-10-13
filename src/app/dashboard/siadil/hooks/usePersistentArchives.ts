import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Archive } from "../types";
import { getArchivesFromAPI, getArchivesTreeFromAPI } from "../data";
import { getAccessTokenFromServer } from "@/lib/api";

const SIADIL_ARCHIVES_KEY = "siadil_archives_storage";
const SIADIL_ARCHIVES_FETCHED_KEY = "siadil_archives_fetched";

/**
 * Helper function untuk flatten tree structure menjadi flat list
 * Digunakan untuk convert hierarchical archives ke flat array
 */
function flattenArchivesTree(archives: Archive[]): Archive[] {
  const result: Archive[] = [];

  function traverse(items: Archive[]) {
    for (const item of items) {
      // Add item tanpa children untuk flat list
      const { children, ...flatItem } = item;
      result.push(flatItem as Archive);

      // Recursively traverse children
      if (children && children.length > 0) {
        traverse(children);
      }
    }
  }

  traverse(archives);
  return result;
}

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

          // 🌲 Try to fetch Archives Tree API first (hierarchical structure)
          console.log("🌲 Attempting to fetch Archives Tree API...");
          let apiArchives: Archive[];

          try {
            const treeArchives = await getArchivesTreeFromAPI(accessToken);
            console.log("✅ Archives Tree API loaded successfully!");
            console.log("   - Total root archives:", treeArchives.length);
            console.log("   - Structure: Hierarchical with children");

            // Flatten tree structure untuk kemudahan penggunaan
            apiArchives = flattenArchivesTree(treeArchives);
            console.log("   - Flattened archives:", apiArchives.length);
          } catch (treeError) {
            console.warn(
              "⚠️ Archives Tree API failed, falling back to flat list"
            );
            console.warn("   - Error:", treeError);
            // Fallback to flat Archives API
            apiArchives = await getArchivesFromAPI(accessToken);
            console.log("📁 Flat Archives API loaded as fallback");
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
