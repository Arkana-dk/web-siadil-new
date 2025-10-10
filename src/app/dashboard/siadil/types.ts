export type Contributor = { name: string; role: string };
export type Archive = {
  id: string;
  name: string;
  code: string;
  parentId: string;
  status?: string;
};
export type Document = {
  id: string;
  number: string;
  title: string;
  description: string;
  documentDate: string;
  contributors: Contributor[];
  archive: string;
  expireDate: string;
  status: string;
  updatedBy: string;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  parentId: string;
  fileType?: string;
  isStarred?: boolean;
  lastAccessed?: string;
  content?: string;
};

export type Filters = {
  keyword: string;
  archive: string[];
  docDateStart: string;
  docDateEnd: string;
  expireDateStart: string;
  expireDateEnd: string;
  expireIn: Record<string, boolean>;
  fileType: string;
};

export type NewDocumentData = {
  number: string;
  title: string;
  description: string;
  documentDate: string;
  archive: string;
  expireDate: string;
  file: File | null;
};

export type Pagination = {
  totalRows: number;
  rowsPerPage: number;
  currentPage: number;
};

export type TableColumn = {
  id: string;
  label: string;
};

export type Reminder = {
  id: string;
  title: string;
  description: string;
  message: string;
  type: "error" | "warning";
  documentId?: string;
  expireDate?: string;
};

// ============================================
// DEMPLON API RESPONSE TYPES
// ============================================

/**
 * Contributor item di dalam archive
 * Setiap archive punya array contributors dengan permission (admin/editor)
 */
export interface ArchiveContributor {
  id: number;
  id_archive: number;
  id_user: string; // Bisa berupa user ID atau group ID (contoh: "group:organization:C001370000")
  name_user: string;
  mode: "admin" | "editor" | string; // Permission level
  date_created: string;
  last_updated: string;
}

/**
 * Response dari Demplon API untuk Archives
 * Endpoint: GET /admin/api/siadil/archives/
 *
 * Response adalah DIRECT ARRAY (bukan object wrapper):
 * [
 *   { id: 17, slug: "...", code: "TIK", ... },
 *   { id: 41, slug: "...", code: "licenses-renewals", ... },
 *   ...
 * ]
 */
export type DemplanArchiveResponse = DemplanArchiveItem[];

/**
 * Single Archive item dari API Demplon
 * Struktur REAL dari API perusahaan:
 * {
 *   "id": 17,
 *   "slug": "bmuz-tik-teknologi-informasi-komunikasi",
 *   "code": "TIK",
 *   "name": "Teknologi, Informasi & Komunikasi",
 *   "description": "Teknologi, Informasi & Komunikasi",
 *   "id_section": null,
 *   "id_parent": null,
 *   "date_created": "2024-01-15T02:09:52.000Z",
 *   "last_updated": "2024-02-13T01:22:41.000Z",
 *   "id_user": "1",
 *   "parent": null,
 *   "contributors": [...]
 * }
 */
export interface DemplanArchiveItem {
  id: number;
  slug: string; // URL-friendly identifier (contoh: "bmuz-tik-teknologi-informasi-komunikasi")
  code: string; // Kode singkat archive (contoh: "TIK")
  name: string; // Nama lengkap archive
  description: string | null;
  id_section: number | null; // ID section jika archive ada di dalam section
  id_parent: number | null; // ID parent archive (null jika root level)
  date_created: string; // ISO 8601 timestamp
  last_updated: string; // ISO 8601 timestamp
  id_user: string; // User ID yang membuat archive
  parent: DemplanArchiveItem | null; // Nested parent object (jika ada)
  contributors: ArchiveContributor[]; // Array of contributors dengan permission
}
