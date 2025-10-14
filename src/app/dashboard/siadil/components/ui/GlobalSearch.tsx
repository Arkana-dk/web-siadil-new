"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Archive } from "../../types";

interface GlobalSearchProps {
  documents: Document[];
  archives: Archive[];
  onDocumentClick: (doc: Document) => void;
  onArchiveClick: (archiveId: string) => void;
  placeholder?: string;
  onSearchChange?: (query: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  documents,
  archives,
  onDocumentClick,
  onArchiveClick,
  placeholder = "Search folders and documents...",
  onSearchChange,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter results
  const filteredArchives = archives.filter((archive) =>
    archive.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.number.toLowerCase().includes(query.toLowerCase()) ||
      doc.description?.toLowerCase().includes(query.toLowerCase()) ||
      doc.archiveName?.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = filteredArchives.length + filteredDocuments.length;
  const hasResults = totalResults > 0;

  // Handle search change
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    setActiveIndex(-1);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasResults) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < totalResults - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          if (activeIndex < filteredArchives.length) {
            handleArchiveClick(filteredArchives[activeIndex]);
          } else {
            handleDocumentClick(
              filteredDocuments[activeIndex - filteredArchives.length]
            );
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleArchiveClick = (archive: Archive) => {
    onArchiveClick(archive.id);
    setQuery("");
    setIsOpen(false);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleDocumentClick = (doc: Document) => {
    onDocumentClick(doc);
    setQuery("");
    setIsOpen(false);
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const getArchiveName = (doc: Document) => {
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
    return doc.archive || "Unknown";
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-demplon focus:bg-white focus:ring-2 focus:ring-demplon/30 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-200 dark:placeholder-gray-400 dark:focus:bg-gray-800"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              if (onSearchChange) {
                onSearchChange("");
              }
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto">
            {!hasResults ? (
              <div className="p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">
                  No results found
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Try searching with different keywords
                </p>
              </div>
            ) : (
              <>
                {/* Archives Section */}
                {filteredArchives.length > 0 && (
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 px-4 py-2 dark:bg-gray-900/50">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Folders ({filteredArchives.length})
                      </h3>
                    </div>
                    <ul className="py-1">
                      {filteredArchives.slice(0, 5).map((archive, index) => (
                        <li key={archive.id}>
                          <button
                            onClick={() => handleArchiveClick(archive)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              activeIndex === index
                                ? "bg-demplon/10 text-demplon dark:bg-demplon/20"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-demplon to-teal-600 shadow-sm">
                              <svg
                                className="h-5 w-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {archive.name}
                              </p>
                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {archive.code}
                              </p>
                            </div>
                            <svg
                              className="h-4 w-4 flex-shrink-0 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents Section */}
                {filteredDocuments.length > 0 && (
                  <div>
                    <div className="bg-gray-50 px-4 py-2 dark:bg-gray-900/50">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Documents ({filteredDocuments.length})
                      </h3>
                    </div>
                    <ul className="py-1">
                      {filteredDocuments.slice(0, 8).map((doc, index) => {
                        const itemIndex = filteredArchives.length + index;
                        return (
                          <li key={doc.id}>
                            <button
                              onClick={() => handleDocumentClick(doc)}
                              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                activeIndex === itemIndex
                                  ? "bg-demplon/10 text-demplon dark:bg-demplon/20"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                                <svg
                                  className="h-5 w-5 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                  {doc.title}
                                </p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    {doc.number}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    in {getArchiveName(doc)}
                                  </span>
                                </div>
                              </div>
                              <svg
                                className="h-4 w-4 flex-shrink-0 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Show more indicator */}
                {totalResults > 13 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-center dark:border-gray-700 dark:bg-gray-900/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {totalResults - 13} more results... Keep typing to refine
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
