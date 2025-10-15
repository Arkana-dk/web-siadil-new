"use client";

import { useState, useEffect, useRef, ReactNode, ChangeEvent } from "react";
import ReactDOM from "react-dom";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { FilterPopover } from "../ui/FilterPopover";
import { ColumnTogglePopover } from "../ui/ColumnTogglePopover";
import { Filters, Archive } from "../../types";
import { ArchiveFilterPopover } from "../ui/ArchiveFilterPopover";

type Column = {
  id: string;
  label: string;
};

type DocumentsContainerProps = {
  children: ReactNode;
  archives: Archive[];
  filters: Filters;
  onFilterChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFilterReset: () => void;
  expireFilterMethod: "range" | "period";
  setExpireFilterMethod: (method: "range" | "period") => void;
  pagination: { totalRows: number; rowsPerPage: number; currentPage: number };
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: number) => void;
  allTableColumns: Column[];
  visibleColumns: Set<string>;
  onColumnToggle: (columnId: string) => void;
  onExport: () => void;
  isExporting: boolean;
  onArchiveCheckboxChange: (archiveCode: string, isChecked: boolean) => void;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
};

export const DocumentsContainer = ({
  children,
  archives,
  filters,
  onFilterChange,
  onCheckboxChange,
  onFilterReset,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  expireFilterMethod,
  setExpireFilterMethod,
  allTableColumns,
  visibleColumns,
  onColumnToggle,
  onExport,
  isExporting,
  onArchiveCheckboxChange,
  viewMode,
}: DocumentsContainerProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnToggleOpen, setIsColumnToggleOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const columnTogglePopoverRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const columnToggleButtonRef = useRef<HTMLButtonElement>(null);
  const [filterPopoverPosition, setFilterPopoverPosition] = useState({
    top: 0,
    left: 0,
  });
  const [columnTogglePopoverPosition, setColumnTogglePopoverPosition] =
    useState({ top: 0, left: 0 });
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuButtonRef = useRef<HTMLButtonElement>(null);
  const exportMenuPopoverRef = useRef<HTMLDivElement>(null);
  const [exportMenuPopoverPosition, setExportMenuPopoverPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useOnClickOutside(
    filterPopoverRef,
    () => setIsFilterOpen(false),
    filterButtonRef,
    ["[data-filter-date-popover]"]
  );
  useOnClickOutside(
    columnTogglePopoverRef,
    () => setIsColumnToggleOpen(false),
    columnToggleButtonRef
  );
  useOnClickOutside(
    exportMenuPopoverRef,
    () => setIsExportMenuOpen(false),
    exportMenuButtonRef
  );

  useEffect(() => {
    if (isFilterOpen && filterButtonRef.current) {
      const calculatePosition = () => {
        if (!filterPopoverRef.current || !filterButtonRef.current) return;
        const buttonRect = filterButtonRef.current.getBoundingClientRect();
        const popoverHeight = filterPopoverRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const margin = 8;
        let top = 0,
          left = 0;
        const popoverWidth = filterPopoverRef.current.offsetWidth;
        left = buttonRect.right - popoverWidth;
        if (spaceBelow > popoverHeight + margin)
          top = buttonRect.bottom + margin;
        else if (spaceAbove > popoverHeight + margin)
          top = buttonRect.top - popoverHeight - margin;
        else top = buttonRect.bottom + margin;
        if (top < margin) top = margin;
        if (top + popoverHeight > window.innerHeight - margin)
          top = window.innerHeight - popoverHeight - margin;
        if (left < margin) left = margin;
        setFilterPopoverPosition({ top, left });
      };
      const timer = setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isFilterOpen]);

  useEffect(() => {
    if (isColumnToggleOpen && columnToggleButtonRef.current) {
      const calculatePosition = () => {
        if (!columnTogglePopoverRef.current || !columnToggleButtonRef.current)
          return;
        const buttonRect =
          columnToggleButtonRef.current.getBoundingClientRect();
        const popoverRect =
          columnTogglePopoverRef.current.getBoundingClientRect();
        const margin = 8;
        let top = buttonRect.bottom + margin;
        let left = buttonRect.right - popoverRect.width;
        if (top + popoverRect.height > window.innerHeight)
          top = buttonRect.top - popoverRect.height - margin;
        if (left < 0) left = buttonRect.left;
        setColumnTogglePopoverPosition({ top, left });
      };
      const timer = setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isColumnToggleOpen]);

  useEffect(() => {
    if (isExportMenuOpen && exportMenuButtonRef.current) {
      const calculatePosition = () => {
        if (!exportMenuPopoverRef.current || !exportMenuButtonRef.current)
          return;
        const buttonRect = exportMenuButtonRef.current.getBoundingClientRect();
        const popoverRect =
          exportMenuPopoverRef.current.getBoundingClientRect();
        const margin = 8;
        let top = buttonRect.bottom + margin;
        const left = buttonRect.right - popoverRect.width;
        if (top + popoverRect.height > window.innerHeight)
          top = buttonRect.top - popoverRect.height - margin;
        setExportMenuPopoverPosition({ top, left });
      };
      const timer = setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isExportMenuOpen]);

  const [isArchiveFilterOpen, setIsArchiveFilterOpen] = useState(false);
  const archiveFilterButtonRef = useRef<HTMLButtonElement>(null);
  const archiveFilterPopoverRef = useRef<HTMLDivElement>(null);
  const [archiveFilterPopoverPosition, setArchiveFilterPopoverPosition] =
    useState({ top: 0, left: 0 });

  useOnClickOutside(
    archiveFilterPopoverRef,
    () => setIsArchiveFilterOpen(false),
    archiveFilterButtonRef
  );

  useEffect(() => {
    if (isArchiveFilterOpen && archiveFilterButtonRef.current) {
      const calculatePosition = () => {
        if (!archiveFilterPopoverRef.current || !archiveFilterButtonRef.current)
          return;
        const buttonRect =
          archiveFilterButtonRef.current.getBoundingClientRect();
        const popoverHeight = archiveFilterPopoverRef.current.offsetHeight;
        const margin = 8;

        let top = buttonRect.bottom + margin;
        if (top + popoverHeight > window.innerHeight) {
          top = buttonRect.top - popoverHeight - margin;
        }

        setArchiveFilterPopoverPosition({ top, left: buttonRect.left });
      };

      const timer = setTimeout(calculatePosition, 0);
      window.addEventListener("resize", calculatePosition);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isArchiveFilterOpen]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="bg-green-50 dark:bg-green-900/30 p-4 border-b border-green-200 dark:border-green-700 flex justify-between items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 22 22"
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
              type="text"
              name="keyword"
              id="keyword"
              placeholder="Search by number, title..."
              value={filters.keyword}
              onChange={onFilterChange}
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-200 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {isClient &&
          isFilterOpen &&
          ReactDOM.createPortal(
            <div
              style={{
                position: "fixed",
                top: `${filterPopoverPosition.top}px`,
                left: `${filterPopoverPosition.left}px`,
                zIndex: 50,
                visibility:
                  filterPopoverPosition.top === 0 ? "hidden" : "visible",
                maxHeight: "75vh",
                width: "448px",
              }}
            >
              <FilterPopover
                ref={filterPopoverRef}
                filters={filters}
                onFilterChange={onFilterChange}
                onCheckboxChange={onCheckboxChange}
                onReset={() => {
                  onFilterReset();
                  setIsFilterOpen(false);
                }}
                onApply={() => setIsFilterOpen(false)}
                expireFilterMethod={expireFilterMethod}
                setExpireFilterMethod={setExpireFilterMethod}
              />
            </div>,
            document.body
          )}

        {isClient &&
          isArchiveFilterOpen &&
          ReactDOM.createPortal(
            <div
              style={{
                position: "fixed",
                top: `${archiveFilterPopoverPosition.top}px`,
                left: `${archiveFilterPopoverPosition.left}px`,
                zIndex: 50,
                visibility:
                  archiveFilterPopoverPosition.top === 0 ? "hidden" : "visible",
              }}
            >
              <ArchiveFilterPopover
                ref={archiveFilterPopoverRef}
                allArchives={archives}
                selectedArchives={filters.archive}
                onArchiveChange={onArchiveCheckboxChange}
              />
            </div>,
            document.body
          )}

        {isClient &&
          isExportMenuOpen &&
          ReactDOM.createPortal(
            <div
              ref={exportMenuPopoverRef}
              style={{
                position: "fixed",
                top: `${exportMenuPopoverPosition.top}px`,
                left: `${exportMenuPopoverPosition.left}px`,
                zIndex: 50,
                visibility:
                  exportMenuPopoverPosition.top === 0 ? "hidden" : "visible",
              }}
              className="w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
            >
              <div className="p-2">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Export data to
                  </p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    onExport();
                    setIsExportMenuOpen(false);
                  }}
                  disabled={isExporting}
                  className="w-full flex items-center px-2 py-1.5 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  <span>{isExporting ? "Exporting..." : "Excel"}</span>
                </button>
              </div>
            </div>,
            document.body
          )}

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            ref={archiveFilterButtonRef}
            onClick={() => setIsArchiveFilterOpen((v) => !v)}
            className={`px-3 py-1.5 text-sm border rounded-md flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 8V21H3V8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 3H1V8H23V3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 12H14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              {filters.archive.length === 0
                ? "Filter by Subfolder"
                : `${filters.archive.length} Subfolder(s) Selected`}
            </span>
          </button>
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterOpen((v) => !v)}
            className="px-3 py-1.5 text-sm border rounded-md flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 22 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5C4 4.44772 4.44772 4 5 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 10H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 2V6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Date Filter</span>
          </button>
          <button
            ref={exportMenuButtonRef}
            onClick={() => setIsExportMenuOpen((v) => !v)}
            className="px-3 py-1.5 text-sm border rounded-md flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path
                d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15L17 10M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Export</span>
          </button>
          <button
            ref={columnToggleButtonRef}
            onClick={() => setIsColumnToggleOpen((v) => !v)}
            className="px-3 py-1.5 text-sm border rounded-md flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 transition-all duration-200 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <path
                d="M3 12L5 10M5 10L3 8M5 10H11M13 12L15 10M15 10L13 8M15 10H21M7 20H17C18.1046 20 19 19.1046 19 18V6C19 4.89543 18.1046 4 17 4H7C5.89543 4 5 6V18C5 19.1046 5.89543 20 7 20Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>View</span>
          </button>

          {isClient &&
            isColumnToggleOpen &&
            ReactDOM.createPortal(
              <div
                style={{
                  position: "fixed",
                  top: `${columnTogglePopoverPosition.top}px`,
                  left: `${columnTogglePopoverPosition.left}px`,
                  zIndex: 50,
                  visibility:
                    columnTogglePopoverPosition.top === 0
                      ? "hidden"
                      : "visible",
                }}
              >
                <ColumnTogglePopover
                  ref={columnTogglePopoverRef}
                  columns={allTableColumns}
                  visibleColumns={visibleColumns}
                  onColumnToggle={onColumnToggle}
                />
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* ===== PERUBAHAN FINAL ADA DI SINI ===== */}
      <div
        className={`overflow-x-auto ${
          viewMode === "grid" ? "p-6" : ""
        } transition-opacity duration-300 ease-in-out`}
        style={{ minHeight: "400px" }}
      >
        {children}
      </div>

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing{" "}
          {Math.min(
            pagination.rowsPerPage * pagination.currentPage,
            pagination.totalRows
          )}{" "}
          of {pagination.totalRows} row(s).
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Rows per page
          </span>
          <select
            value={pagination.rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {pagination.currentPage} of{" "}
            {Math.ceil(pagination.totalRows / pagination.rowsPerPage) || 1}
          </span>
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage ===
                Math.ceil(pagination.totalRows / pagination.rowsPerPage) ||
              pagination.totalRows === 0
            }
            className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
