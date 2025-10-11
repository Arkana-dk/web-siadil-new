/**
 * CONTOH IMPLEMENTASI API DOKUMEN TERBARU
 *
 * File ini berisi contoh-contoh cara menggunakan API dokumen terbaru
 * di berbagai scenario dalam aplikasi SIADIL.
 *
 * Dokumentasi lengkap: LATEST_DOCUMENTS_API_GUIDE.md
 */

"use client";

import React from "react";
import { useLatestDocuments } from "@/app/dashboard/siadil/hooks/useLatestDocuments";
import { getLatestDocumentsFromAPI } from "@/app/dashboard/siadil/data";
import { Document } from "@/app/dashboard/siadil/types";

// ============================================
// CONTOH 1: Component Sederhana - 5 Dokumen Terbaru
// ============================================
export function LatestDocumentsWidget() {
  const [docs, refetch, { isLoading, error }] = useLatestDocuments({
    length: 5,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-600">
          <p className="font-semibold">Gagal memuat dokumen</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={refetch}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-gray-900">Dokumen Terbaru</h3>
        <button
          onClick={refetch}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {docs.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada dokumen</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="py-2 px-3 border-b border-gray-100 hover:bg-gray-50 rounded transition"
            >
              <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{doc.archiveName}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">ID: {doc.id}</span>
                {doc.reminderActive && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                      Reminder
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// CONTOH 2: Component dengan Pagination
// ============================================
export function LatestDocumentsPaginated() {
  const [currentPage, setCurrentPage] = React.useState(0);
  const pageSize = 10;

  const [docs, , { isLoading }] = useLatestDocuments({
    start: currentPage * pageSize,
    length: pageSize,
  });

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (docs.length === pageSize) {
      // Asumsi: masih ada data berikutnya
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Dokumen Terbaru (Paginated)</h3>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 border border-gray-200 rounded hover:shadow"
              >
                <p className="font-semibold">{doc.title}</p>
                <p className="text-sm text-gray-600">{doc.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Halaman {currentPage + 1}
            </span>
            <button
              onClick={handleNext}
              disabled={docs.length < pageSize}
              className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// CONTOH 3: Component dengan Load More / Infinite Scroll
// ============================================
export function LatestDocumentsInfinite() {
  const [allDocs, setAllDocs] = React.useState<Document[]>([]);
  const [page, setPage] = React.useState(0);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const pageSize = 10;

  // Initial load
  const [initialDocs, , { isLoading: isInitialLoading }] = useLatestDocuments({
    length: pageSize,
    autoFetch: true,
  });

  React.useEffect(() => {
    if (initialDocs.length > 0 && allDocs.length === 0) {
      setAllDocs(initialDocs);
    }
  }, [initialDocs, allDocs.length]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const moreDocs = await getLatestDocumentsFromAPI(undefined, {
        start: nextPage * pageSize,
        length: pageSize,
      });

      if (moreDocs.length === 0) {
        setHasMore(false);
      } else {
        setAllDocs([...allDocs, ...moreDocs]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isInitialLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Semua Dokumen Terbaru</h3>

      <div className="space-y-2 mb-4">
        {allDocs.map((doc, index) => (
          <div
            key={`${doc.id}-${index}`}
            className="p-3 border border-gray-200 rounded"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{doc.title}</p>
                <p className="text-sm text-gray-600">{doc.archiveName}</p>
              </div>
              <span className="text-xs text-gray-400">#{doc.id}</span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={isLoadingMore}
          className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "Load More"}
        </button>
      )}

      {!hasMore && (
        <p className="text-center text-gray-500 text-sm">
          Tidak ada dokumen lagi
        </p>
      )}
    </div>
  );
}

// ============================================
// CONTOH 4: Function untuk Custom Sorting
// ============================================
export async function fetchCustomSortedDocuments() {
  // Sort berdasarkan tanggal expire (descending)
  const expiringSoonDocs = await getLatestDocumentsFromAPI(undefined, {
    start: 0,
    length: 20,
    sort: ["document_expire_date"],
    sortdir: ["ASC"], // Yang paling dekat kedaluwarsa di atas
  });

  console.log("Dokumen yang akan kedaluwarsa:", expiringSoonDocs);
  return expiringSoonDocs;
}

// ============================================
// CONTOH 5: Component Dashboard Card dengan Auto Refresh
// ============================================
export function LatestDocsDashboardCard() {
  const [docs, refetch, { isLoading }] = useLatestDocuments({ length: 3 });

  // Auto refresh setiap 5 menit
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log("Auto refreshing latest documents...");
      refetch();
    }, 5 * 60 * 1000); // 5 menit

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
          <h3 className="text-lg font-bold text-gray-900">Dokumen Terbaru</h3>
        </div>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      <div className="space-y-2">
        {docs.slice(0, 3).map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg p-3 hover:shadow-md transition"
          >
            <p className="font-medium text-sm text-gray-900 line-clamp-1">
              {doc.title}
            </p>
            <p className="text-xs text-gray-500 mt-1">{doc.archiveName}</p>
          </div>
        ))}
      </div>

      <button
        onClick={refetch}
        className="mt-3 w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
      >
        Lihat Semua →
      </button>
    </div>
  );
}

// ============================================
// CONTOH 6: Integration dengan Search & Filter
// ============================================
export function LatestDocsWithSearch() {
  const [docs] = useLatestDocuments({ length: 50 });
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredDocs = React.useMemo(() => {
    if (!searchQuery) return docs;

    const query = searchQuery.toLowerCase();
    return docs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.archiveName?.toLowerCase().includes(query)
    );
  }, [docs, searchQuery]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari dokumen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-2">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="p-3 border rounded hover:shadow">
            <p className="font-semibold">{doc.title}</p>
            <p className="text-sm text-gray-600">{doc.description}</p>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <p className="text-center text-gray-500 py-4">Tidak ada hasil</p>
      )}
    </div>
  );
}

// ============================================
// Export all examples
// ============================================
const examples = {
  LatestDocumentsWidget,
  LatestDocumentsPaginated,
  LatestDocumentsInfinite,
  LatestDocsDashboardCard,
  LatestDocsWithSearch,
  fetchCustomSortedDocuments,
};

export default examples;
