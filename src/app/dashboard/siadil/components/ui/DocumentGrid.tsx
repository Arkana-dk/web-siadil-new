"use client";

// src/app/dashboard/siadil/components/ui/DocumentGrid.tsx

import { useState } from "react";
import { Document, Archive } from "../../types";
import { ActionMenu } from "./ActionMenu";

// Right-click context menu removed per request

type DocumentGridProps = {
  documents: Document[];
  archives: Archive[];
  selectedDocumentIds: Set<string>;
  onDocumentSelect: (id: string, event?: React.MouseEvent) => void;
  onMove: (docId: string) => void;
  onToggleStar: (docId: string, event: React.MouseEvent) => void;
  onEdit: (docId: string) => void;
  onDelete: (docId: string) => void;
  onManageContributors: (docId: string) => void;
  isInfoPanelOpen: boolean;
};

export const DocumentGrid = ({
  documents,
  archives,
  selectedDocumentIds,
  onDocumentSelect,
  onMove,
  onToggleStar,
  onEdit,
  onDelete,
  onManageContributors,
  isInfoPanelOpen,
}: DocumentGridProps) => {
  const [activeActionMenu, setActiveActionMenu] = useState<null | {
    docId: string;
    buttonEl: HTMLButtonElement;
    anchorRect: {
      top: number;
      bottom: number;
      left: number;
      right: number;
      width: number;
      height: number;
    };
  }>(null);
  // Removed custom context menu handler

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID");

  const getArchiveDisplayName = (doc: Document) => {
    if (doc.archiveName) {
      return doc.archiveName;
    }
    const byId = archives.find((a) => a.id === doc.parentId);
    if (byId) {
      return byId.name;
    }
    if (doc.archive) {
      const byCode = archives.find((a) => a.code === doc.archive);
      if (byCode) {
        return byCode.name;
      }
    }
    return "Root";
  };

  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${
          isInfoPanelOpen
            ? "md:grid-cols-2 lg:grid-cols-3"
            : "md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {documents.map((doc) => (
          <div
            key={doc.id}
            id={`doc-grid-${doc.id}`}
            // right-click context menu disabled
            onClick={(e) => onDocumentSelect(doc.id, e)}
            className={`group relative flex flex-col cursor-pointer overflow-hidden rounded-lg border bg-gradient-to-br p-4 shadow-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:from-gray-800 dark:to-gray-700/50 hover:shadow-md hover:-translate-y-0.5 ${
              selectedDocumentIds.has(doc.id)
                ? "border-green-400 ring-2 ring-green-500/30 dark:border-green-600"
                : "border-gray-200 hover:border-demplon dark:hover:border-demplon"
            }`}
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex items-center -mr-2">
                <button
                  onClick={(e) => onToggleStar(doc.id, e)}
                  className="relative z-10 p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Toggle Star"
                >
                  <svg
                    className={`h-5 w-5 transition-all ${
                      doc.isStarred
                        ? "text-yellow-400 fill-current"
                        : "hover:text-yellow-400"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  className="relative z-10 p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
                  aria-label="Actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Jika menu untuk dokumen ini sudah terbuka, tutup saja lalu keluar
                    if (activeActionMenu?.docId === doc.id) {
                      setActiveActionMenu(null);
                      return;
                    }

                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveActionMenu({
                      docId: doc.id,
                      buttonEl: e.currentTarget,
                      anchorRect: {
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right,
                        width: rect.width,
                        height: rect.height,
                      },
                    });
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-grow min-h-[3rem]">
              <h4
                className="font-bold text-base text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2"
                title={doc.title}
              >
                {doc.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-auto">
                in {getArchiveDisplayName(doc)}
              </p>
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>{doc.number}</span>
                <span>{formatDate(doc.updatedDate)}</span>
              </div>
            </div>

            {activeActionMenu?.docId === doc.id && (
              <ActionMenu
                documentId={doc.id}
                onClose={() => setActiveActionMenu(null)}
                buttonEl={activeActionMenu.buttonEl}
                anchorRect={activeActionMenu.anchorRect}
                onMove={onMove}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageContributors={onManageContributors}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
