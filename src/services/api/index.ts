/**
 * Centralized API Service
 * All API calls should go through this service
 */

// Export utilities
export { API_CONFIG, APIError, apiFetch } from "./utils";

// Export authentication services
export {
  login,
  logout,
  verifyToken,
  refreshToken,
  type LoginCredentials,
  type LoginResponse,
  type SessionData,
} from "@/services/api/auth.service";

// Export Demplon services
export {
  // Archives
  fetchArchives,
  fetchArchiveTree,
  createArchive,
  updateArchive,
  deleteArchive,
  // Documents
  fetchDocuments,
  fetchDocumentsByArchive,
  fetchDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  // Reminders
  fetchReminders,
  fetchRemindersByType,
  // Utilities
  buildApiUrl,
  isApiSuccess,
  // Types
  type Archive,
  type Document,
  type Reminder,
  type PaginationParams,
  type PaginatedResponse,
} from "@/services/api/demplon.service";
