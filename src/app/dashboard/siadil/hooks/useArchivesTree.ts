import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Archive } from "../types";
import { getArchivesTreeFromAPI } from "../data";

/**
 * Custom Hook untuk mengambil Archives dalam Format Tree dari Demplon API
 *
 * Hook ini menggunakan endpoint dengan tree=true untuk mendapatkan
 * struktur hierarkis archives dengan relasi parent-child.
 *
 * Sangat berguna untuk:
 * - Tree view / folder structure
 * - Navigation hierarkis
 * - Sidebar dengan nested folders
 * - Breadcrumb dengan full path
 *
 * @param options - Opsi untuk fetching archives
 *   - autoFetch: boolean (auto fetch saat component mount, default true)
 *
 * @returns [archivesTree, refetch, { isLoading, error, flatArchives }]
 *   - archivesTree: Archive[] (hierarchical structure dengan children)
 *   - refetch: Function untuk manual refresh
 *   - isLoading: boolean (loading state)
 *   - error: Error | null (error state)
 *   - flatArchives: Archive[] (flattened list untuk lookup)
 *
 * Contoh penggunaan:
 * ```typescript
 * // Di dalam component
 * const [tree, refetch, { isLoading, error, flatArchives }] = useArchivesTree();
 *
 * // Render tree view
 * function renderTree(archives) {
 *   return archives.map(archive => (
 *     <TreeNode key={archive.id} label={archive.name}>
 *       {archive.children && renderTree(archive.children)}
 *     </TreeNode>
 *   ));
 * }
 *
 * // Lookup specific archive dari flat list
 * const findArchive = (id) => flatArchives.find(a => a.id === id);
 * ```
 */
export function useArchivesTree(options?: { autoFetch?: boolean }): [
  Archive[],
  () => Promise<void>,
  {
    isLoading: boolean;
    error: Error | null;
    flatArchives: Archive[];
  }
] {
  const { data: session } = useSession();
  const [archivesTree, setArchivesTree] = useState<Archive[]>([]);
  const [flatArchives, setFlatArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const autoFetch = options?.autoFetch !== false; // Default true

  // Helper function untuk flatten tree menjadi array
  const flattenTree = (archives: Archive[]): Archive[] => {
    const result: Archive[] = [];

    const traverse = (items: Archive[]) => {
      for (const item of items) {
        // Add item tanpa children untuk flat list
        const { children, ...flatItem } = item;
        result.push(flatItem as Archive);

        // Recursively traverse children
        if (children && children.length > 0) {
          traverse(children);
        }
      }
    };

    traverse(archives);
    return result;
  };

  // Fungsi untuk fetch archives tree
  const fetchArchivesTree = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 useArchivesTree - Starting fetch...");
      console.log("🔑 Session available:", !!session);

      // Tunggu sampai session ada (user sudah login)
      if (!session) {
        console.log("⏳ No session yet, waiting for login...");
        setArchivesTree([]);
        setFlatArchives([]);
        setIsLoading(false);
        return;
      }

      console.log("📡 Fetching archives tree from API...");

      // Fetch archives tree dengan hierarchical structure
      const tree = await getArchivesTreeFromAPI();

      console.log("📦 API Response received:");
      console.log("   - Total root archives:", tree.length);
      console.log("   - First archive:", tree[0]);

      // Flatten tree untuk easy lookup
      const flat = flattenTree(tree);
      console.log("   - Total archives (flattened):", flat.length);

      setArchivesTree(tree);
      setFlatArchives(flat);
      console.log(
        `✅ Archives tree loaded and set to state (${tree.length} roots, ${flat.length} total)`
      );
    } catch (err) {
      console.error("❌ Error loading archives tree:", err);
      if (err instanceof Error) {
        console.error("   - Error message:", err.message);
        console.error("   - Error stack:", err.stack);
        setError(err);
      } else {
        setError(new Error("Unknown error occurred"));
      }
      console.log("⚠️ Archives tree cannot be loaded - API error");
      setArchivesTree([]);
      setFlatArchives([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto fetch saat component mount atau session berubah
  useEffect(() => {
    if (autoFetch) {
      fetchArchivesTree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, autoFetch]);

  // Return tree, refetch function, dan state
  return [archivesTree, fetchArchivesTree, { isLoading, error, flatArchives }];
}
