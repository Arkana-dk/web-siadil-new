/**
 * CONTOH IMPLEMENTASI API ARCHIVES TREE
 *
 * File ini berisi contoh-contoh cara menggunakan API archives tree
 * untuk berbagai scenario dalam aplikasi SIADIL.
 *
 * Dokumentasi lengkap: ARCHIVES_TREE_API_GUIDE.md
 */

"use client";

import React, { useState, useMemo } from "react";
import { useArchivesTree } from "@/app/dashboard/siadil/hooks/useArchivesTree";
import { getArchivesTreeFromAPI } from "@/app/dashboard/siadil/data";
import { Archive } from "@/app/dashboard/siadil/types";

// ============================================
// CONTOH 1: Sidebar Tree View Sederhana
// ============================================
export function SimpleSidebarTree() {
  const [tree, refetch, { isLoading, error }] = useArchivesTree();

  const renderTreeNode = (archive: Archive, level: number = 0) => {
    const hasChildren = archive.children && archive.children.length > 0;

    return (
      <div key={archive.id} style={{ marginLeft: `${level * 20}px` }}>
        <div
          style={{
            padding: "8px",
            cursor: "pointer",
            borderRadius: "4px",
            marginBottom: "4px",
            backgroundColor: level === 0 ? "#f0fdf4" : "white",
            border: "1px solid #e5e7eb",
          }}
        >
          {hasChildren ? "📁" : "📄"} {archive.name}
          <span
            style={{ color: "#6b7280", fontSize: "12px", marginLeft: "8px" }}
          >
            ({archive.code})
          </span>
        </div>
        {hasChildren && (
          <div>
            {archive.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading tree...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9fafb" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h3 style={{ margin: 0 }}>Archives Tree</h3>
        <button
          onClick={refetch}
          style={{
            padding: "6px 12px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
      {tree.map((root) => renderTreeNode(root))}
    </div>
  );
}

// ============================================
// CONTOH 2: Expandable Tree dengan State
// ============================================
export function ExpandableTree() {
  const [tree] = useArchivesTree();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (archive: Archive) => {
    const hasChildren = archive.children && archive.children.length > 0;
    const isExpanded = expanded.has(archive.id);

    return (
      <div key={archive.id} style={{ marginBottom: "4px" }}>
        <div
          onClick={() => hasChildren && toggleExpand(archive.id)}
          style={{
            padding: "10px",
            cursor: hasChildren ? "pointer" : "default",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {hasChildren && (
            <span
              style={{
                fontSize: "12px",
                color: "#6b7280",
                width: "16px",
                textAlign: "center",
              }}
            >
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
          {!hasChildren && (
            <span style={{ width: "16px", textAlign: "center" }}>📄</span>
          )}
          <span style={{ fontWeight: 500 }}>{archive.name}</span>
          <span style={{ color: "#6b7280", fontSize: "12px" }}>
            {archive.code}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div style={{ marginLeft: "24px", marginTop: "4px" }}>
            {archive.children!.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h3>Expandable Tree View</h3>
      <div style={{ marginTop: "16px" }}>{tree.map(renderNode)}</div>
    </div>
  );
}

// ============================================
// CONTOH 3: Dropdown Select dengan Indentasi
// ============================================
export function ArchiveDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [tree, , { isLoading }] = useArchivesTree();

  // Build options dengan indentasi visual
  const buildOptions = (
    archives: Archive[],
    level: number = 0
  ): React.ReactElement[] => {
    const options: React.ReactElement[] = [];

    for (const archive of archives) {
      const indent = "—".repeat(level);
      options.push(
        <option key={archive.id} value={archive.id}>
          {indent} {archive.name} ({archive.code})
        </option>
      );

      if (archive.children && archive.children.length > 0) {
        options.push(...buildOptions(archive.children, level + 1));
      }
    }

    return options;
  };

  if (isLoading) {
    return (
      <select disabled>
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      <option value="">Pilih Archive</option>
      {buildOptions(tree)}
    </select>
  );
}

// ============================================
// CONTOH 4: Breadcrumb Navigation
// ============================================
export function ArchiveBreadcrumb({
  currentArchiveId,
}: {
  currentArchiveId: string;
}) {
  const [, , { flatArchives }] = useArchivesTree();

  // Build path dari current ke root
  const path = useMemo(() => {
    const result: Archive[] = [];
    let current = flatArchives.find((a) => a.id === currentArchiveId);

    while (current) {
      result.unshift(current);
      if (current.parentId === "root") break;
      current = flatArchives.find((a) => a.id === current!.parentId);
    }

    return result;
  }, [flatArchives, currentArchiveId]);

  if (path.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#6b7280" }}>🏠 Home</span>
        {path.map((archive, index) => (
          <React.Fragment key={archive.id}>
            <span style={{ color: "#d1d5db" }}>›</span>
            <span
              style={{
                fontWeight: index === path.length - 1 ? 600 : 400,
                color: index === path.length - 1 ? "#10b981" : "#4b5563",
              }}
            >
              {archive.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ============================================
// CONTOH 5: Searchable Tree
// ============================================
export function SearchableTree() {
  const [tree, , { flatArchives }] = useArchivesTree();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;

    const query = searchQuery.toLowerCase();
    const matchingIds = new Set<string>();

    // Find matching archives
    flatArchives.forEach((archive) => {
      if (
        archive.name.toLowerCase().includes(query) ||
        archive.code.toLowerCase().includes(query)
      ) {
        matchingIds.add(archive.id);

        // Add all parents to show path
        let current = archive;
        while (current.parentId && current.parentId !== "root") {
          matchingIds.add(current.parentId);
          current = flatArchives.find((a) => a.id === current.parentId)!;
        }
      }
    });

    // Filter tree
    const filterTree = (archives: Archive[]): Archive[] => {
      return archives
        .filter((a) => matchingIds.has(a.id))
        .map((a) => ({
          ...a,
          children: a.children ? filterTree(a.children) : undefined,
        }));
    };

    return filterTree(tree);
  }, [tree, searchQuery, flatArchives]);

  const renderNode = (archive: Archive) => {
    const hasChildren = archive.children && archive.children.length > 0;

    return (
      <div key={archive.id} style={{ marginBottom: "8px" }}>
        <div
          style={{
            padding: "10px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #10b981",
            borderRadius: "6px",
          }}
        >
          📁 <strong>{archive.name}</strong>{" "}
          <span style={{ color: "#6b7280" }}>({archive.code})</span>
        </div>
        {hasChildren && (
          <div style={{ marginLeft: "20px", marginTop: "8px" }}>
            {archive.children!.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Searchable Tree</h3>
      <input
        type="text"
        placeholder="Search archives..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          marginBottom: "16px",
        }}
      />

      {filteredTree.length === 0 ? (
        <p style={{ color: "#6b7280", textAlign: "center" }}>
          No archives found
        </p>
      ) : (
        <div>{filteredTree.map(renderNode)}</div>
      )}
    </div>
  );
}

// ============================================
// CONTOH 6: Tree Statistics
// ============================================
export function TreeStatistics() {
  const [tree, , { flatArchives, isLoading }] = useArchivesTree();

  const stats = useMemo(() => {
    const getMaxDepth = (archives: Archive[], depth: number = 0): number => {
      if (archives.length === 0) return depth;

      let maxDepth = depth;
      for (const archive of archives) {
        if (archive.children && archive.children.length > 0) {
          const childDepth = getMaxDepth(archive.children, depth + 1);
          maxDepth = Math.max(maxDepth, childDepth);
        }
      }
      return maxDepth;
    };

    return {
      totalArchives: flatArchives.length,
      rootArchives: tree.length,
      maxDepth: getMaxDepth(tree),
      avgChildrenPerRoot:
        tree.length > 0 ? (flatArchives.length - tree.length) / tree.length : 0,
    };
  }, [tree, flatArchives]);

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Archive Tree Statistics</h3>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "bold", color: "#10b981" }}
          >
            {stats.totalArchives}
          </div>
          <div style={{ color: "#6b7280", marginTop: "4px" }}>
            Total Archives
          </div>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "bold", color: "#3b82f6" }}
          >
            {stats.rootArchives}
          </div>
          <div style={{ color: "#6b7280", marginTop: "4px" }}>
            Root Archives
          </div>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}
          >
            {stats.maxDepth}
          </div>
          <div style={{ color: "#6b7280", marginTop: "4px" }}>Max Depth</div>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontSize: "32px", fontWeight: "bold", color: "#8b5cf6" }}
          >
            {stats.avgChildrenPerRoot.toFixed(1)}
          </div>
          <div style={{ color: "#6b7280", marginTop: "4px" }}>
            Avg Children/Root
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONTOH 7: Custom Function - Find Archive
// ============================================
export async function findArchiveByCode(code: string): Promise<Archive | null> {
  const tree = await getArchivesTreeFromAPI();

  const search = (archives: Archive[]): Archive | null => {
    for (const archive of archives) {
      if (archive.code === code) return archive;
      if (archive.children) {
        const found = search(archive.children);
        if (found) return found;
      }
    }
    return null;
  };

  return search(tree);
}

// ============================================
// Export all examples
// ============================================
const examples = {
  SimpleSidebarTree,
  ExpandableTree,
  ArchiveDropdown,
  ArchiveBreadcrumb,
  SearchableTree,
  TreeStatistics,
  findArchiveByCode,
};

export default examples;
