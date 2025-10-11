"use client";

import { Document } from "../../types";
import { useRef } from "react";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onDocumentClick: (doc: Document) => void;
};

export const AllHistoryModal = ({
  isOpen,
  onClose,
  documents,
  onDocumentClick,
}: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800 flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Riwayat Akses Dokumen
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <svg
              className="h-6 w-6 text-gray-500"
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
        <div className="p-4 overflow-y-auto">
          {documents.length > 0 ? (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => onDocumentClick(doc)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white truncate">
                      {doc.title}
                    </p>
                    {(doc.archiveName || doc.archive) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Arsip: {doc.archiveName || doc.archive}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Diakses pada:{" "}
                      {new Date(doc.lastAccessed!).toLocaleString("id-ID")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Tidak ada riwayat akses.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
