import { useMemo, useEffect } from "react";
import { usePersistentDocuments } from "./usePersistentDocuments";
import { usePersistentArchives } from "./usePersistentArchives";
import { Archive, Document } from "../types";

const getAllDescendantIds = (
  folderId: string,
  archives: Archive[]
): string[] => {
  const directChildren = archives
    .filter((archive) => archive.parentId === folderId)
    .map((archive) => archive.id);

  const allChildren = [...directChildren];
  directChildren.forEach((childId) => {
    allChildren.push(...getAllDescendantIds(childId, archives));
  });
  return allChildren;
};

/**
 * 🔧 Helper: Extract missing archives dari documents yang tidak ada di archives list
 * Solusi untuk masalah: documents punya id_archive tapi archive-nya tidak muncul di UI
 */
const extractMissingArchivesFromDocuments = (
  documents: Document[],
  existingArchives: Archive[]
): Archive[] => {
  const existingArchiveIds = new Set(existingArchives.map((a) => a.id));
  const missingArchivesMap = new Map<string, Archive>();

  documents.forEach((doc) => {
    // Cek apakah doc.parentId sudah ada di archives
    if (!existingArchiveIds.has(doc.parentId)) {
      // Cek apakah document punya data archiveData dari API
      if (doc.archiveData) {
        const archiveId = String(doc.archiveData.id || doc.parentId);

        // Jangan tambahkan duplikat
        if (!missingArchivesMap.has(archiveId)) {
          const newArchive: Archive = {
            id: archiveId,
            name: doc.archiveData.name || "Unknown Archive",
            code: doc.archiveData.code || "UNKNOWN",
            parentId: doc.archiveData.id_parent
              ? String(doc.archiveData.id_parent)
              : "root",
            status: "active",
          };
          missingArchivesMap.set(archiveId, newArchive);
        }
      }
    }
  });

  return Array.from(missingArchivesMap.values());
};

export const useData = (currentFolderId: string) => {
  const [documents, setDocuments, documentsState] = usePersistentDocuments();
  const [archives, setArchives, archivesState] = usePersistentArchives();

  // 🔥 AUTO-ADD MISSING ARCHIVES: Tambahkan archives yang ada di documents tapi tidak ada di archives list
  useEffect(() => {
    if (
      documents.length > 0 &&
      archives.length > 0 &&
      !documentsState.isLoading &&
      !archivesState.isLoading
    ) {
      const missingArchives = extractMissingArchivesFromDocuments(
        documents,
        archives
      );

      if (missingArchives.length > 0) {
        console.log(
          "🔧 AUTO-FIX: Found missing archives in documents:",
          missingArchives.length
        );
        console.log(
          "   - Missing archive IDs:",
          missingArchives.map((a) => `${a.id} (${a.code})`).join(", ")
        );

        // Merge missing archives ke existing archives
        setArchives((prev) => {
          const merged = [...prev, ...missingArchives];
          console.log(
            `   - ✅ Added ${missingArchives.length} missing archives to list`
          );
          console.log(`   - Total archives now: ${merged.length}`);
          return merged;
        });
      }
    }
  }, [
    documents,
    archives,
    documentsState.isLoading,
    archivesState.isLoading,
    setArchives,
  ]);

  const searchableDocuments = useMemo(() => {
    const activeDocuments = documents.filter((doc) => doc.status !== "Trashed");

    if (currentFolderId === "root") {
      return activeDocuments;
    }
    const relevantFolderIds = [
      currentFolderId,
      ...getAllDescendantIds(currentFolderId, archives),
    ];
    return activeDocuments.filter((doc) =>
      relevantFolderIds.includes(doc.parentId)
    );
  }, [currentFolderId, documents, archives]);

  const documentsForFiltering = useMemo(() => {
    const activeDocuments = documents.filter((doc) => doc.status !== "Trashed");

    if (currentFolderId === "root") {
      return [];
    }
    const relevantFolderIds = [
      currentFolderId,
      ...getAllDescendantIds(currentFolderId, archives),
    ];
    return activeDocuments.filter((doc) =>
      relevantFolderIds.includes(doc.parentId)
    );
  }, [currentFolderId, documents, archives]);

  const breadcrumbItems = useMemo(() => {
    const path = [];
    let currentId = currentFolderId;
    while (currentId !== "root") {
      const folder = archives.find((a) => a.id === currentId);
      if (folder) {
        path.unshift({ label: folder.name, id: folder.id });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    path.unshift({ label: "Root", id: "root" });
    return path;
  }, [currentFolderId, archives]);

  const archiveDocCounts = useMemo(() => {
    const counts = documents
      .filter((doc) => doc.status !== "Trashed")
      .reduce((acc, doc) => {
        const parentArchive = archives.find((a) => a.id === doc.parentId);
        if (parentArchive) {
          acc[parentArchive.code] = (acc[parentArchive.code] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    // 🔍 DEBUG: Log archive counts
    console.log("📊 Archive Document Counts:");
    console.log("   - Total archives:", archives.length);
    console.log(
      "   - Total active documents:",
      documents.filter((d) => d.status !== "Trashed").length
    );
    console.log("   - Archives with docs:", Object.keys(counts).length);
    console.log("   - Sample counts:", Object.entries(counts).slice(0, 5));

    // Debug documents without matching archive
    const docsWithoutArchive = documents.filter((doc) => {
      const hasArchive = archives.find((a) => a.id === doc.parentId);
      return !hasArchive && doc.status !== "Trashed";
    });
    if (docsWithoutArchive.length > 0) {
      console.warn(
        "   ⚠️ Documents without matching archive:",
        docsWithoutArchive.length
      );
      console.warn("   ⚠️ Sample doc:", {
        id: docsWithoutArchive[0].id,
        title: docsWithoutArchive[0].title,
        parentId: docsWithoutArchive[0].parentId,
        archive: docsWithoutArchive[0].archive,
      });
    }

    return counts;
  }, [documents, archives]);

  const quickAccessDocuments = useMemo(() => {
    // Filter dokumen yang aktif (tidak di trash)
    const activeDocuments = documents.filter((doc) => doc.status !== "Trashed");

    // 🔥 FILTER DUPLICATES: Remove duplicate documents by ID
    const uniqueDocuments = Array.from(
      new Map(activeDocuments.map((doc) => [doc.id, doc])).values()
    );

    // Dokumen yang sudah pernah dibuka (recently accessed)
    const accessedDocs = uniqueDocuments.filter((doc) => doc.lastAccessed);

    console.log("🎯 [Quick Access Debug]:", {
      totalDocs: documents.length,
      activeDocs: activeDocuments.length,
      uniqueDocs: uniqueDocuments.length,
      duplicatesRemoved: activeDocuments.length - uniqueDocuments.length,
      accessedDocs: accessedDocs.length,
      accessedList: accessedDocs.map((d) => ({
        id: d.id,
        title: d.title,
        lastAccessed: d.lastAccessed,
      })),
    });

    // Jika ada dokumen yang pernah dibuka, gunakan itu
    if (accessedDocs.length > 0) {
      const sorted = [...accessedDocs]
        .sort(
          (a, b) =>
            new Date(b.lastAccessed!).getTime() -
            new Date(a.lastAccessed!).getTime()
        )
        .slice(0, 6);

      console.log("✅ [Quick Access] Showing accessed docs:", sorted.length);
      return sorted;
    }

    // Jika belum ada yang dibuka, tampilkan dokumen terbaru (recently updated) sebagai fallback
    const recentDocs = [...uniqueDocuments]
      .sort(
        (a, b) =>
          new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
      )
      .slice(0, 6);

    console.log(
      "ℹ️ [Quick Access] Showing recent docs (fallback):",
      recentDocs.length
    );
    return recentDocs;
  }, [documents]);

  // Semua dokumen yang pernah dibuka (tanpa slice) untuk fitur "Lihat semua"
  const quickAccessAllDocuments = useMemo(() => {
    const activeDocuments = documents.filter((doc) => doc.status !== "Trashed");

    // 🔥 FILTER DUPLICATES: Remove duplicate documents by ID
    const uniqueDocuments = Array.from(
      new Map(activeDocuments.map((doc) => [doc.id, doc])).values()
    );

    const accessedDocs = uniqueDocuments.filter((doc) => doc.lastAccessed);

    // Jika ada dokumen yang pernah dibuka, gunakan itu
    if (accessedDocs.length > 0) {
      return [...accessedDocs]
        .sort(
          (a, b) =>
            new Date(b.lastAccessed!).getTime() -
            new Date(a.lastAccessed!).getTime()
        )
        .slice(0, 20); // View All tampilkan lebih banyak
    }

    // Fallback: dokumen terbaru
    return [...uniqueDocuments]
      .sort(
        (a, b) =>
          new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
      )
      .slice(0, 20);
  }, [documents]);

  const starredDocuments = useMemo(() => {
    return documents.filter((doc) => doc.isStarred);
  }, [documents]);

  const subfolderArchives = useMemo(() => {
    return archives.filter(
      (archive) =>
        archive.parentId === currentFolderId && archive.status !== "Trashed"
    );
  }, [currentFolderId, archives]);

  const handleToggleStar = (docId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );
  };

  return {
    documents,
    setDocuments,
    archives,
    setArchives,
    archivesState, // { isLoading, error }
    documentsState, // { isLoading, error }
    searchableDocuments,
    documentsForFiltering,
    breadcrumbItems,
    archiveDocCounts,
    quickAccessDocuments,
    quickAccessAllDocuments,
    starredDocuments,
    subfolderArchives,
    handleToggleStar,
  };
};
