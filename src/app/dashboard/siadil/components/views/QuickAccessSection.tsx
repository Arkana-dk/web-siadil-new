"use client";

import React from "react";
import { Document, Archive } from "../../types";

interface QuickAccessSectionProps {
  documents: Document[];
  archives: Archive[]; // Add archives prop
  onDocumentClick: (doc: Document) => void;
  isInfoPanelOpen: boolean;
  onViewAll?: () => void;
}

const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({
  documents,
  archives,
  onDocumentClick,
  isInfoPanelOpen,
  onViewAll,
}) => {
  // Create maps from archives prop
  const ARCHIVE_BY_ID = new Map<string, string>(
    archives.map((a) => [a.id, a.name])
  );
  const ARCHIVE_BY_CODE = new Map<string, string>(
    archives.map((a) => [a.code, a.name])
  );

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    doc: Document
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDocumentClick(doc);
    }
  };

  const getArchiveName = (doc: Document) =>
    ARCHIVE_BY_ID.get(doc.parentId) ||
    (doc.archive ? ARCHIVE_BY_CODE.get(doc.archive) : undefined) ||
    "Unknown";

  const getArchiveLabel = (doc: Document) => doc.archive || getArchiveName(doc);

  // Remove any text inside parentheses (and the parentheses) from titles
  const cleanTitle = (title: string) =>
    title.replace(/\s*\([^)]*\)/g, "").trim();

  // When the info panel (sidebar) is open, show only 4 items to fit nicely
  const displayedDocs = isInfoPanelOpen ? documents.slice(0, 4) : documents;

  // Use a responsive list layout similar to Reminders (horizontal cards)
  const gridClasses = isInfoPanelOpen
    ? "grid-cols-1 md:grid-cols-1 lg:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mb-10">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-demplon to-teal-600 shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Quick Access
          </h2>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-demplon hover:text-white hover:border-demplon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-demplon/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-demplon"
            aria-label="View all Quick Access"
          >
            View All
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Quick access to the documents you recently viewed and edited.
      </p>

      {displayedDocs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#01793B] to-emerald-500 text-white ring-1 ring-white/20">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            No Quick Access yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Documents you open will appear here automatically.
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tip: open a document from the Archives section below to get started.
          </p>
        </div>
      ) : (
        <div className={`grid ${gridClasses} gap-4 md:gap-5`}>
          {displayedDocs.map((doc) => (
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              aria-label={`Open document ${cleanTitle(doc.title)}`}
              onKeyDown={(e) => handleKeyDown(e, doc)}
              onClick={() => onDocumentClick(doc)}
              className="group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-xl bg-white/70 p-4 pl-5 ring-1 ring-gray-200/70 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-[#01793B]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#01793B]/45 dark:bg-gray-900/50 dark:ring-white/10"
            >
              {/* Left accent bar */}
              <span className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-[#01793B] to-emerald-400 opacity-90" />
              {/* Left icon */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#01793B] to-emerald-500 text-white shadow-sm ring-1 ring-inset ring-white/20">
                <svg
                  className="h-6 w-6"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.6"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* Right content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4
                      className="truncate text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                      title={cleanTitle(doc.title)}
                    >
                      {cleanTitle(doc.title)}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap"
                        title={`Archive: ${getArchiveName(doc)}`}
                      >
                        {getArchiveLabel(doc)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        Updated: {formatDate(doc.updatedDate)}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-gray-500"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 5l7 7-7 7"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickAccessSection;
