"use client";

// src/app/dashboard/siadil/components/views/DocumentView.tsx

import React from "react";
import {
  Document,
  Archive,
  Filters,
  Pagination,
  TableColumn,
} from "../../types";
import { DocumentsContainer } from "../container/DocumentsContainer";
import { DocumentTable } from "../ui/DocumentTable";
import { DocumentGrid } from "../ui/DocumentGrid";
import ViewModeToggle from "../ui/ViewModeToggle";
import { ArchiveCard, PersonalArchiveCard } from "../ui/ArchiveCards";

interface DocumentViewProps {
  archives: Archive[];
  paginatedDocuments: Document[];
  visibleColumns: Set<string>;
  sortColumn: keyof Document | null;
  sortOrder: "asc" | "desc" | null;
  selectedDocumentIds: Set<string>;
  filters: Filters;
  expireFilterMethod: "range" | "period";
  pagination: Pagination;
  isExporting: boolean;
  viewMode: "list" | "grid";
  allTableColumns: TableColumn[];
  archiveDocCounts: Record<string, number>;
  onManageContributors: (docId: string) => void;
  onGoBack: () => void;
  setViewMode: (mode: "list" | "grid") => void;
  onFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterReset: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: number) => void;
  setExpireFilterMethod: (method: "range" | "period") => void;
  onColumnToggle: (columnId: string) => void;
  onArchiveCheckboxChange: (archiveCode: string, isChecked: boolean) => void;
  onExport: () => void;
  onSortChange: (columnId: keyof Document) => void;
  onDocumentSelect: (docId: string, event?: React.MouseEvent) => void;
  onMove: (docId: string) => void;
  onEdit: (docId: string) => void;
  onDelete: (docId: string) => void;
  onToggleStar: (docId: string, event: React.MouseEvent) => void;
  isInfoPanelOpen: boolean;
  currentFolderName: string | undefined;
  onArchiveClick: (id: string) => void;
  onArchiveMenuClick?: (e: React.MouseEvent, archiveId: string) => void;
  userName?: string;
  userId?: string;
  userPhoto?: string;
}

const DocumentView: React.FC<DocumentViewProps> = (props) => {
  const {
    archives,
    paginatedDocuments,
    visibleColumns,
    sortColumn,
    sortOrder,
    selectedDocumentIds,
    filters,
    expireFilterMethod,
    pagination,
    isExporting,
    viewMode,
    onGoBack,
    setViewMode,
    onFilterChange,
    onCheckboxChange,
    onFilterReset,
    onPageChange,
    onRowsPerPageChange,
    setExpireFilterMethod,
    allTableColumns,
    onColumnToggle,
    onArchiveCheckboxChange,
    onExport,
    onSortChange,
    onDocumentSelect,
    onMove,
    onEdit,
    onDelete,
    onToggleStar,
    currentFolderName,
    archiveDocCounts,
    onArchiveClick,
    onManageContributors,
    isInfoPanelOpen,
    onArchiveMenuClick,
    userName,
    userId,
    userPhoto,
  } = props;

  const hasDocuments = paginatedDocuments.length > 0;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Kembali"
          >
            <svg
              className="w-4 h-4 text-gray-700 dark:text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentFolderName || "Arsip"}
          </h2>
        </div>
      </div>

      {archives.length > 0 && (
        <div className="mb-10 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Sub-Archives
            </h2>
          </div>

          {/* Pisahkan Personal dan Company Sub-Archives */}
          {(() => {
            const personalArchive = archives.find((a) => a.code === "PERSONAL");
            const companyArchives = archives.filter(
              (a) => a.code !== "PERSONAL"
            );

            return (
              <div className="space-y-6">
                {/* Personal Archive - Always show if exists */}
                {personalArchive && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Personal Sub-Archive
                    </h3>
                    <PersonalArchiveCard
                      archive={personalArchive}
                      onClick={() => onArchiveClick(personalArchive.id)}
                      userName={userName}
                      userId={userId}
                      userPhoto={userPhoto}
                    />
                  </div>
                )}

                {/* Company Sub-Archives */}
                {companyArchives.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Company Sub-Archives
                    </h3>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
                      {companyArchives.map((archive) => (
                        <ArchiveCard
                          key={archive.id}
                          archive={archive}
                          docCount={archiveDocCounts[archive.code] || 0}
                          onClick={() => onArchiveClick(archive.id)}
                          onMenuClick={onArchiveMenuClick}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Dokumen
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="transition-all duration-200 hover:shadow-md rounded-lg">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>
      </div>
      <DocumentsContainer
        archives={archives}
        filters={filters}
        onFilterChange={onFilterChange}
        onCheckboxChange={onCheckboxChange}
        onFilterReset={onFilterReset}
        pagination={pagination}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        expireFilterMethod={expireFilterMethod}
        setExpireFilterMethod={setExpireFilterMethod}
        allTableColumns={allTableColumns}
        visibleColumns={visibleColumns}
        onColumnToggle={onColumnToggle}
        isExporting={isExporting}
        onArchiveCheckboxChange={onArchiveCheckboxChange}
        onExport={onExport}
        viewMode={viewMode}
        setViewMode={setViewMode}
      >
        {hasDocuments ? (
          viewMode === "list" ? (
            <DocumentTable
              documents={paginatedDocuments}
              visibleColumns={visibleColumns}
              onSortChange={onSortChange}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onColumnToggle={onColumnToggle}
              selectedDocumentIds={selectedDocumentIds}
              onDocumentSelect={onDocumentSelect}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageContributors={onManageContributors}
            />
          ) : (
            <DocumentGrid
              documents={paginatedDocuments}
              selectedDocumentIds={selectedDocumentIds}
              archives={archives}
              onDocumentSelect={onDocumentSelect}
              onMove={onMove}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStar={onToggleStar}
              isInfoPanelOpen={isInfoPanelOpen}
              onManageContributors={onManageContributors}
            />
          )
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada dokumen yang cocok dengan pencarian Anda.
            </p>
          </div>
        )}
      </DocumentsContainer>
    </div>
  );
};

export default DocumentView;
