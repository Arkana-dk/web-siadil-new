"use client";

import { useRef, useState, useMemo } from "react";
import { Document } from "../../types";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onOpenArchive: (doc: Document) => void;
};

export const ViewAllQuickAccessModal = ({
  isOpen,
  onClose,
  documents,
  onOpenArchive,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return documents;
    const q = query.toLowerCase();
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.number.toLowerCase().includes(q) ||
        (d.archive || "").toLowerCase().includes(q) ||
        (d.archiveName || "").toLowerCase().includes(q)
    );
  }, [documents, query]);

  if (!isOpen) return null;

  const formatDate = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(iso))
      : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="flex w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800 max-h-[90vh]"
      >
        <div className="border-b p-5 dark:border-gray-700 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            All Quick Access
          </h3>
          <div className="flex-1 max-w-sm relative">
            <input
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-demplon focus:ring-demplon dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Search title/number/archive..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
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
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-demplon/40"
          >
            <svg
              className="h-6 w-6"
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
        </div>

        <div className="overflow-y-auto p-4 divide-y divide-gray-100 dark:divide-gray-700">
          {filtered.length === 0 ? (
            <p className="py-14 text-center text-sm text-gray-500">
              No documents found.
            </p>
          ) : (
            <ul className="space-y-0">
              {filtered.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md px-2"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onOpenArchive(doc);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenArchive(doc);
                      onClose();
                    }
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#01793B] to-emerald-500 text-white ring-1 ring-white/20">
                        <svg
                          className="h-4 w-4"
                          width="16"
                          height="16"
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
                      <h4
                        className="truncate text-sm font-semibold text-gray-900 dark:text-white"
                        title={doc.title}
                      >
                        {doc.title}
                      </h4>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {(doc.archiveName || doc.archive) && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
                          {doc.archiveName || doc.archive}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
                        Updated: {formatDate(doc.updatedDate)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(doc.lastAccessed!)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
