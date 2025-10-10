"use client";

import { useRef, useEffect } from "react";
import { Document, Archive } from "../../types";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

type SearchResult = {
  doc: Document;
  matchReason: string;
};

type SearchPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documents: Document[];
  archives: Archive[]; // Add archives prop
  onDocumentSelect: (document: Document) => void;
};

export const SearchPopup = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  documents,
  archives,
  onDocumentSelect,
}: SearchPopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(popupRef, onClose);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const getArchivePath = (parentId: string): string => {
    const path = [];
    let currentId = parentId;
    while (currentId !== "root") {
      const folder = archives.find((a) => a.id === currentId);
      if (folder) {
        path.unshift(folder.name);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return path.join(" / ");
  };

  const filteredDocuments: SearchResult[] = searchQuery
    ? documents
        .map((doc) => {
          const query = searchQuery.toLowerCase();

          if (doc.title.toLowerCase().includes(query)) {
            return { doc, matchReason: `Cocok di judul` };
          }
          if (doc.number.toLowerCase().includes(query)) {
            return { doc, matchReason: `Cocok di nomor: ${doc.number}` };
          }
          const matchingContributor = doc.contributors.find((c) =>
            c.name.toLowerCase().includes(query)
          );
          if (matchingContributor) {
            return {
              doc,
              matchReason: `Cocok di kontributor: ${matchingContributor.name}`,
            };
          }
          if (doc.description.toLowerCase().includes(query)) {
            return { doc, matchReason: `Cocok di deskripsi` };
          }

          return null;
        })
        .filter((result): result is SearchResult => result !== null)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 sm:p-16 z-50">
      <div
        ref={popupRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-full"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by number, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>
        <div className="overflow-y-auto">
          {searchQuery && filteredDocuments.length > 0 ? (
            <ul className="p-2">
              {filteredDocuments.map(({ doc, matchReason }) => (
                <li key={doc.id}>
                  <button
                    onClick={() => onDocumentSelect(doc)}
                    className="w-full text-left flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        In: {getArchivePath(doc.parentId) || "Root"}
                      </p>
                      <p className="mt-1 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 px-1.5 py-0.5 rounded-full inline-block">
                        {matchReason}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center p-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? "No documents found."
                  : "Start typing to search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
