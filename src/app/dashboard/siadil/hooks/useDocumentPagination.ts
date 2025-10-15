import { useState, useMemo } from "react";
import { Document } from "../types";

export const useDocumentPagination = (
  documents: Document[],
  documentCurrentPage: number,
  setDocumentCurrentPage: (page: number) => void
) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setDocumentCurrentPage(1);
  };

  const paginatedDocuments = useMemo(() => {
    const startIndex = (documentCurrentPage - 1) * rowsPerPage;
    return documents.slice(startIndex, startIndex + rowsPerPage);
  }, [documents, documentCurrentPage, rowsPerPage]);

  const pagination = {
    totalRows: documents.length,
    rowsPerPage,
    currentPage: documentCurrentPage,
  };

  // Generate unique key untuk trigger animation saat page change
  const paginationKey = `page-${documentCurrentPage}-${rowsPerPage}`;

  return {
    rowsPerPage,
    handleRowsPerPageChange,
    paginatedDocuments,
    pagination,
    paginationKey,
  };
};
