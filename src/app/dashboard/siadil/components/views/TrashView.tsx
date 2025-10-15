"use client";

import React from "react";
import { Document, Archive } from "../../types";

interface TrashViewProps {
  documents: Document[];
  archives: Archive[];
  trashedArchives: Archive[];
  filter: "all" | "documents" | "folders";
  onRestore: (docId: string) => void;
  onDeletePermanently: (docId: string) => void;
  onRestoreArchive: (archiveId: string) => void;
  onDeleteArchivePermanently: (archiveId: string) => void;
  onEmptyTrash: () => void;
}

const TrashView: React.FC<TrashViewProps> = ({
  documents,
  archives,
  trashedArchives,
  filter,
  onRestore,
  onDeletePermanently,
  onRestoreArchive,
  onDeleteArchivePermanently,
  onEmptyTrash,
}) => {
  const getParentArchiveName = (parentId: string) => {
    const parent = archives.find((a) => a.id === parentId);
    return parent ? parent.name : "Unknown Archive";
  };

  const filteredDocuments = filter === "folders" ? [] : documents;
  const filteredArchives = filter === "documents" ? [] : trashedArchives;

  return (
    <div className="mb-10">
      {/* Info and Empty Trash Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Items here will be automatically deleted after 30 days.
        </p>
        {(documents.length > 0 || trashedArchives.length > 0) && (
          <button
            onClick={onEmptyTrash}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all dark:bg-red-900/50 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {filteredDocuments.length > 0 || filteredArchives.length > 0 ? (
        <div className="space-y-3">
          {/* Render Folders */}
          {filteredArchives.map((archive) => (
            <div
              key={archive.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {archive.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ID: {archive.id} | Folder | Dihapus pada:{" "}
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onRestoreArchive(archive.id)}
                  className="px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 hover:shadow-sm transition-all duration-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800 dark:hover:bg-teal-900/40"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDeleteArchivePermanently(archive.id)}
                  className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Render Documents */}
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-white hover:border-gray-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {doc.title} ({getParentArchiveName(doc.parentId)})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ID: {doc.id} | Dihapus pada:{" "}
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onRestore(doc.id)}
                  className="px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 hover:shadow-sm transition-all duration-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800 dark:hover:bg-teal-900/40"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDeletePermanently(doc.id)}
                  className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all duration-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
            Trash is Empty
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "documents"
              ? "Deleted documents will appear here."
              : filter === "folders"
              ? "Deleted folders will appear here."
              : "Deleted items will appear here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrashView;
