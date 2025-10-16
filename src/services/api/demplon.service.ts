/**
 * Demplon API Service
 * Handles all Demplon-related API calls (Archives, Documents, Reminders)
 */

import { apiFetch } from "./utils";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Archive {
  id: string;
  name: string;
  code: string;
  parentId: string;
  status?: string;
  children?: Archive[];
}

export interface Document {
  id: string;
  number: string;
  title: string;
  description: string;
  documentDate: string;
  contributors: Array<{ name: string; role: string }>;
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
  reminderActive?: boolean;
  reminderType?: "error" | "warning" | "info" | string;
  reminderMessage?: string | null;
  reminderSource?: "api" | "derived";
  daysUntilExpire?: number | null;
  expireStatus?: "expired" | "expiringSoon" | "active" | "noExpire";
  documentExpired?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  message: string;
  type: "error" | "warning";
  documentId?: string;
  expireDate?: string;
}

export interface PaginationParams {
  start?: number;
  length?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  recordsTotal: number;
  recordsFiltered: number;
}

// ============================================================================
// ARCHIVES API
// ============================================================================

/**
 * Fetch all archives from Demplon API
 */
export async function fetchArchives(
  accessToken: string
): Promise<PaginatedResponse<Archive>> {
  const response = await apiFetch<PaginatedResponse<Archive>>(
    "/api/demplon/archives",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response;
}

/**
 * Fetch archive tree structure
 */
export async function fetchArchiveTree(
  accessToken: string,
  parentId?: string
): Promise<Archive[]> {
  const url = parentId
    ? `/api/demplon/archives?parentId=${parentId}`
    : "/api/demplon/archives";

  const response = await apiFetch<PaginatedResponse<Archive>>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

/**
 * Create new archive
 */
export async function createArchive(
  accessToken: string,
  archiveData: Partial<Archive>
): Promise<Archive> {
  const response = await apiFetch<Archive>("/api/demplon/archives", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(archiveData),
  });

  return response;
}

/**
 * Update archive
 */
export async function updateArchive(
  accessToken: string,
  archiveId: string,
  archiveData: Partial<Archive>
): Promise<Archive> {
  const response = await apiFetch<Archive>(
    `/api/demplon/archives/${archiveId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(archiveData),
    }
  );

  return response;
}

/**
 * Delete archive
 */
export async function deleteArchive(
  accessToken: string,
  archiveId: string
): Promise<void> {
  await apiFetch<void>(`/api/demplon/archives/${archiveId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// ============================================================================
// DOCUMENTS API
// ============================================================================

/**
 * Fetch documents with pagination
 */
export async function fetchDocuments(
  accessToken: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Document>> {
  const queryParams = new URLSearchParams();
  if (params?.start !== undefined)
    queryParams.set("start", String(params.start));
  if (params?.length !== undefined)
    queryParams.set("length", String(params.length));
  if (params?.search) queryParams.set("search", params.search);

  const url = `/api/demplon/documents${
    queryParams.toString() ? `?${queryParams}` : ""
  }`;

  const response = await apiFetch<PaginatedResponse<Document>>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}

/**
 * Fetch documents by archive
 */
export async function fetchDocumentsByArchive(
  accessToken: string,
  archiveCode: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Document>> {
  const queryParams = new URLSearchParams({ archive: archiveCode });
  if (params?.start !== undefined)
    queryParams.set("start", String(params.start));
  if (params?.length !== undefined)
    queryParams.set("length", String(params.length));

  const response = await apiFetch<PaginatedResponse<Document>>(
    `/api/demplon/documents?${queryParams}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response;
}

/**
 * Fetch single document by ID
 */
export async function fetchDocumentById(
  accessToken: string,
  documentId: string
): Promise<Document> {
  const response = await apiFetch<Document>(
    `/api/demplon/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response;
}

/**
 * Create new document
 */
export async function createDocument(
  accessToken: string,
  documentData: Partial<Document>
): Promise<Document> {
  const response = await apiFetch<Document>("/api/demplon/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(documentData),
  });

  return response;
}

/**
 * Update document
 */
export async function updateDocument(
  accessToken: string,
  documentId: string,
  documentData: Partial<Document>
): Promise<Document> {
  const response = await apiFetch<Document>(
    `/api/demplon/documents/${documentId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(documentData),
    }
  );

  return response;
}

/**
 * Delete document
 */
export async function deleteDocument(
  accessToken: string,
  documentId: string
): Promise<void> {
  await apiFetch<void>(`/api/demplon/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// ============================================================================
// REMINDERS API
// ============================================================================

/**
 * Fetch reminders with pagination
 */
export async function fetchReminders(
  accessToken: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Reminder>> {
  const queryParams = new URLSearchParams();
  if (params?.start !== undefined)
    queryParams.set("start", String(params.start));
  if (params?.length !== undefined)
    queryParams.set("length", String(params.length));

  const url = `/api/demplon/reminders${
    queryParams.toString() ? `?${queryParams}` : ""
  }`;

  const response = await apiFetch<PaginatedResponse<Reminder>>(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response;
}

/**
 * Fetch reminders by type
 */
export async function fetchRemindersByType(
  accessToken: string,
  type: "error" | "warning" | "all"
): Promise<Reminder[]> {
  const response = await apiFetch<PaginatedResponse<Reminder>>(
    `/api/demplon/reminders?type=${type}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Build API URL with query parameters
 */
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string {
  if (!params) return endpoint;

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    queryParams.set(key, String(value));
  });

  return `${endpoint}?${queryParams.toString()}`;
}

/**
 * Check if API response is successful
 */
export function isApiSuccess<T>(response: PaginatedResponse<T>): boolean {
  return response.data !== undefined && Array.isArray(response.data);
}
