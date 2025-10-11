export type Contributor = { name: string; role: string };
export type Archive = {
  id: string;
  name: string;
  code: string;
  parentId: string;
  status?: string;
  children?: Archive[]; // Support untuk tree structure
};
export type Document = {
  id: string;
  number: string;
  title: string;
  description: string;
  documentDate: string;
  contributors: Contributor[];
  archive: string;
  archiveName?: string;
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
  documentExpired?: boolean;
  reminderActive?: boolean;
  reminderType?: "error" | "warning" | "info" | string;
  reminderInfo?: boolean;
  reminderObject?: boolean;
  reminderLink?: boolean;
  reminderSource?: "api" | "derived";
  reminderMessage?: string | null;
  daysUntilExpire?: number | null;
  expireStatus?: "expired" | "expiringSoon" | "active" | "noExpire";
  notification?: boolean;
  completion?: boolean;
  filesCount?: number;
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

/**
 * Response dari Demplon API untuk Reminders
 * Endpoint: GET /admin/api/demplon/reminders/?start=0&length=10
 *
 * Response structure:
 * {
 *   "data": [...],
 *   "recordsTotal": 100,
 *   "recordsFiltered": 100
 * }
 */
export interface DemplonRemindersResponse {
  data: DemplonReminderItem[];
  recordsTotal: number; // Total records in database
  recordsFiltered: number; // Total after filtering
}

/**
 * Single Reminder item dari API Demplon
 * Struktur dari endpoint /admin/api/demplon/reminders/
 */
export interface DemplonReminderItem {
  id: number;
  unique: string; // Unique identifier
  number: string; // Document number (contoh: "DTS 3.1", "JAJAPWEB")
  id_archive: number; // Archive ID
  title: string; // Document title
  description: string | null; // Document description
  document_date: string; // ISO 8601 timestamp
  document_expire_date: string | null; // ISO 8601 timestamp expire date
  notification: boolean; // Notification status
  reminder: boolean; // Reminder status
  id_section: number | null;
  date_created: string; // ISO 8601 timestamp
  last_updated: string; // ISO 8601 timestamp
  id_user: string; // Creator user ID
  archive: DocumentArchive; // Archive details
  files: DocumentFile[]; // Attached files
  contributors: unknown[];
  notifications_reminders: unknown[];
  document_expired: boolean; // Whether document is expired
  reminder_active: boolean; // Whether reminder is active
  reminder_info: boolean; // Info reminder flag
  reminder_type: "info" | "warning" | "error" | string; // Reminder type
  reminder_object: boolean;
  reminder_link: boolean;
  completion: boolean;
}

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
  children?: DemplanArchiveItem[]; // Optional children untuk tree structure
}

/**
 * Response dari Demplon API untuk Documents
 * Endpoint: GET /admin/api/siadil/documents/?length=6&reminder_active=true
 *
 * Response adalah OBJECT dengan struktur:
 * {
 *   "data": [...], // Array of documents
 *   "length": 10,  // Jumlah yang diminta
 *   "total": 13    // Total yang tersedia
 * }
 */
export interface DemplonDocumentResponse {
  data: DemplonDocumentItem[];
  length: number; // Jumlah hasil yang diminta (dari query param)
  total: number; // Total dokumen yang tersedia di database
}

/**
 * File category untuk document
 */
export interface DocumentFileCategory {
  id: number;
  name: string;
}

/**
 * File yang terlampir di document
 */
export interface DocumentFile {
  id: number;
  id_archive: number;
  id_document: number;
  id_filecategory: number | null;
  file: string; // Filename
  total_page: number | null;
  content: string | null; // Extracted text content
  description: string | null;
  indexed: number; // Status indexing (0-4)
  date_indexed: string | null;
  date_created: string;
  last_updated: string;
  id_user: string;
}

/**
 * Archive detail di dalam document
 */
export interface DocumentArchive {
  id: number;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  id_section: number | null;
  id_parent: number | null;
  date_created: string;
  last_updated: string;
  id_user: string;
  filecategories: DocumentFileCategory[];
}

/**
 * Single Document item dari API Demplon
 * Struktur REAL dari API perusahaan dengan struktur lengkap
 */
export interface DemplonDocumentItem {
  id: number;
  unique: string; // Unique identifier string
  number: string; // Nomor dokumen (contoh: "DTS 3.1", "JAJAPWEB")
  id_archive: number; // ID archive tempat dokumen disimpan
  title: string; // Judul dokumen
  description: string | null; // Deskripsi dokumen
  document_date: string; // ISO 8601 timestamp (contoh: "2024-09-10T00:00:00.000Z")
  document_expire_date: string | null; // ISO 8601 timestamp expire date
  notification: boolean; // Status notifikasi
  reminder: boolean; // Status reminder
  id_section: number | null; // ID section
  date_created: string; // ISO 8601 timestamp
  last_updated: string; // ISO 8601 timestamp
  id_user: string; // User ID yang membuat dokumen
  archive: DocumentArchive; // Nested archive object dengan detail lengkap
  files: DocumentFile[]; // Array of files terlampir
  contributors: unknown[]; // Array contributors (structure varies per implementation)
  notifications_reminders: unknown[]; // Array notification/reminder objects (structure varies)
  document_expired: boolean; // Computed: apakah dokumen expired
  reminder_active: boolean; // Status reminder aktif
  reminder_info: boolean; // Info reminder
  reminder_type: "info" | "warning" | "error" | string; // Tipe reminder
  reminder_object: boolean; // Reminder object flag
  reminder_link: boolean; // Reminder link flag
  completion: boolean; // Status completion
}
