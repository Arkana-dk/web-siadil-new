import { useMemo } from "react";
import { usePersistentDocuments } from "./usePersistentDocuments";
import { usePersistentArchives } from "./usePersistentArchives";
import { Archive } from "../types";

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

export const useData = (currentFolderId: string) => {
  const [documents, setDocuments, documentsState] = usePersistentDocuments();
  const [archives, setArchives, archivesState] = usePersistentArchives();

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
    return [...documents]
      .filter((doc) => doc.lastAccessed)
      .sort(
        (a, b) =>
          new Date(b.lastAccessed!).getTime() -
          new Date(a.lastAccessed!).getTime()
      )
      .slice(0, 6);
  }, [documents]);

  // Semua dokumen yang pernah dibuka (tanpa slice) untuk fitur "Lihat semua"
  const quickAccessAllDocuments = useMemo(() => {
    return [...documents]
      .filter((doc) => doc.lastAccessed)
      .sort(
        (a, b) =>
          new Date(b.lastAccessed!).getTime() -
          new Date(a.lastAccessed!).getTime()
      )
      .slice(0, 10); // batasi View All ke 10 dokumen terbaru
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
