"use client";

import React, { useState, useMemo } from "react";
import { Archive } from "../../types";
import { ArchiveCard, PersonalArchiveCard } from "../ui/ArchiveCards";

interface ArchiveViewProps {
  archives: Archive[];
  archiveDocCounts: Record<string, number>;
  onArchiveClick: (id: string) => void;
  searchQuery: string;
  onArchiveMenuClick?: (e: React.MouseEvent, archiveId: string) => void;
  userName?: string;
  userId?: string;
  userPhoto?: string;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({
  archives,
  archiveDocCounts,
  onArchiveClick,
  searchQuery,
  onArchiveMenuClick,
  userName,
  userId,
  userPhoto,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArchives = useMemo(() => {
    const archivesInCurrentFolder = archives.filter(
      (a) => a.parentId === "root" && a.status !== "Trashed"
    );
    if (!searchQuery) {
      return archivesInCurrentFolder;
    }
    return archivesInCurrentFolder.filter((archive) =>
      archive.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, archives]);

  // Filter hanya company archives (exclude PERSONAL)
  const companyArchivesFiltered = useMemo(() => {
    return filteredArchives.filter((a) => a.code !== "PERSONAL");
  }, [filteredArchives]);

  // 8 cards total = 1 Personal + 7 Company
  const COMPANY_PER_PAGE = 7; // 7 company cards per page (Personal selalu tampil)

  const paginatedArchives = useMemo(() => {
    const startIndex = (currentPage - 1) * COMPANY_PER_PAGE;
    return companyArchivesFiltered.slice(
      startIndex,
      startIndex + COMPANY_PER_PAGE
    );
  }, [companyArchivesFiltered, currentPage]);

  const totalPages = Math.ceil(
    companyArchivesFiltered.length / COMPANY_PER_PAGE
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            currentPage === i
              ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="mb-10">
      {paginatedArchives.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {/* Personal Card - SELALU di posisi pertama */}
          <PersonalArchiveCard
            archive={{
              id: "personal-user",
              code: "PERSONAL",
              name: "Personal",
              parentId: "root",
            }}
            onClick={() => onArchiveClick("personal-user")}
            userName={userName}
            userId={userId}
            userPhoto={userPhoto}
          />

          {/* Company Archives */}
          {paginatedArchives.map((archive) => (
            <ArchiveCard
              key={archive.id}
              archive={archive}
              docCount={archiveDocCounts[archive.code] || 0}
              onClick={() => onArchiveClick(archive.id)}
              onMenuClick={onArchiveMenuClick}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
          {/* Personal Card tetap tampil meski archives kosong */}
          <PersonalArchiveCard
            archive={{
              id: "personal-user",
              code: "PERSONAL",
              name: "Personal",
              parentId: "root",
            }}
            onClick={() => onArchiveClick("personal-user")}
            userName={userName}
            userId={userId}
            userPhoto={userPhoto}
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          {renderPageNumbers()}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ArchiveView;
