/**
 * Filter Utility untuk Menghapus Dokumen Duplikat
 *
 * Fungsi ini dapat digunakan untuk memfilter dokumen yang duplikat
 * tanpa mengubah sistem yang telah ada.
 *
 * @example
 * import { removeDuplicateDocuments } from '@/lib/filterDuplicates';
 *
 * const uniqueDocuments = removeDuplicateDocuments(documents);
 * // atau dengan custom key
 * const uniqueByNumber = removeDuplicateDocuments(documents, 'number');
 */

import { Document, Reminder } from "@/app/dashboard/siadil/types";

/**
 * Menghapus dokumen duplikat berdasarkan key tertentu
 *
 * @param documents - Array dokumen yang akan difilter
 * @param uniqueKey - Key yang digunakan untuk mendeteksi duplikat (default: 'id')
 * @returns Array dokumen tanpa duplikat
 */
export function removeDuplicateDocuments<T extends Document>(
  documents: T[],
  uniqueKey: keyof T = "id"
): T[] {
  const seen = new Set<string>();
  const uniqueDocuments: T[] = [];

  for (const doc of documents) {
    const keyValue = String(doc[uniqueKey]);

    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      uniqueDocuments.push(doc);
    }
  }

  return uniqueDocuments;
}

/**
 * Menghapus dokumen duplikat berdasarkan multiple keys
 * Dokumen dianggap duplikat jika semua key yang ditentukan sama
 *
 * @param documents - Array dokumen yang akan difilter
 * @param keys - Array of keys yang digunakan untuk mendeteksi duplikat
 * @returns Array dokumen tanpa duplikat
 *
 * @example
 * // Menghapus duplikat berdasarkan number DAN title
 * const unique = removeDuplicatesByMultipleKeys(documents, ['number', 'title']);
 */
export function removeDuplicatesByMultipleKeys<T extends Document>(
  documents: T[],
  keys: (keyof T)[]
): T[] {
  const seen = new Set<string>();
  const uniqueDocuments: T[] = [];

  for (const doc of documents) {
    // Buat composite key dari semua keys yang ditentukan
    const compositeKey = keys.map((key) => String(doc[key])).join("|");

    if (!seen.has(compositeKey)) {
      seen.add(compositeKey);
      uniqueDocuments.push(doc);
    }
  }

  return uniqueDocuments;
}

/**
 * Menghapus dokumen duplikat dengan prioritas (dokumen pertama yang ditemukan dipertahankan)
 * Berguna ketika ada duplikat tapi ingin mempertahankan yang paling baru/lama
 *
 * @param documents - Array dokumen yang akan difilter
 * @param uniqueKey - Key yang digunakan untuk mendeteksi duplikat
 * @param priorityFn - Fungsi untuk menentukan prioritas (return true jika doc1 lebih prioritas dari doc2)
 * @returns Array dokumen tanpa duplikat dengan prioritas
 *
 * @example
 * // Pertahankan dokumen dengan updatedDate terbaru
 * const unique = removeDuplicatesWithPriority(
 *   documents,
 *   'number',
 *   (doc1, doc2) => new Date(doc1.updatedDate) > new Date(doc2.updatedDate)
 * );
 */
export function removeDuplicatesWithPriority<T extends Document>(
  documents: T[],
  uniqueKey: keyof T = "id",
  priorityFn: (doc1: T, doc2: T) => boolean
): T[] {
  const documentMap = new Map<string, T>();

  for (const doc of documents) {
    const keyValue = String(doc[uniqueKey]);
    const existing = documentMap.get(keyValue);

    if (!existing || priorityFn(doc, existing)) {
      documentMap.set(keyValue, doc);
    }
  }

  return Array.from(documentMap.values());
}

/**
 * Menghapus reminder duplikat berdasarkan key tertentu
 *
 * @param reminders - Array reminder yang akan difilter
 * @param uniqueKey - Key yang digunakan untuk mendeteksi duplikat (default: 'id')
 * @returns Array reminder tanpa duplikat
 */
export function removeDuplicateReminders<T extends Reminder>(
  reminders: T[],
  uniqueKey: keyof T = "id"
): T[] {
  const seen = new Set<string>();
  const uniqueReminders: T[] = [];

  for (const reminder of reminders) {
    const keyValue = String(reminder[uniqueKey]);

    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      uniqueReminders.push(reminder);
    }
  }

  return uniqueReminders;
}

/**
 * Mendapatkan statistik duplikasi
 * Berguna untuk debugging dan monitoring
 *
 * @param documents - Array dokumen yang akan diperiksa
 * @param uniqueKey - Key yang digunakan untuk mendeteksi duplikat
 * @returns Object berisi statistik duplikasi
 *
 * @example
 * const stats = getDuplicateStats(documents, 'number');
 * console.log(`Total: ${stats.total}, Unique: ${stats.unique}, Duplicates: ${stats.duplicates}`);
 */
export function getDuplicateStats<T extends Document>(
  documents: T[],
  uniqueKey: keyof T = "id"
): {
  total: number;
  unique: number;
  duplicates: number;
  duplicateKeys: string[];
} {
  const keyCount = new Map<string, number>();

  for (const doc of documents) {
    const keyValue = String(doc[uniqueKey]);
    keyCount.set(keyValue, (keyCount.get(keyValue) || 0) + 1);
  }

  const duplicateKeys = Array.from(keyCount.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key);

  return {
    total: documents.length,
    unique: keyCount.size,
    duplicates: documents.length - keyCount.size,
    duplicateKeys,
  };
}

/**
 * Mendapatkan daftar dokumen yang duplikat
 * Mengembalikan object dengan key sebagai nilai yang duplikat dan array dokumen sebagai value
 *
 * @param documents - Array dokumen yang akan diperiksa
 * @param uniqueKey - Key yang digunakan untuk mendeteksi duplikat
 * @returns Map berisi dokumen-dokumen yang duplikat
 *
 * @example
 * const duplicates = findDuplicateDocuments(documents, 'number');
 * duplicates.forEach((docs, key) => {
 *   console.log(`Dokumen dengan ${key} muncul ${docs.length} kali`);
 * });
 */
export function findDuplicateDocuments<T extends Document>(
  documents: T[],
  uniqueKey: keyof T = "id"
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const doc of documents) {
    const keyValue = String(doc[uniqueKey]);
    const existing = groups.get(keyValue) || [];
    groups.set(keyValue, [...existing, doc]);
  }

  // Filter hanya yang duplikat (lebih dari 1 dokumen)
  const duplicates = new Map<string, T[]>();
  groups.forEach((docs, key) => {
    if (docs.length > 1) {
      duplicates.set(key, docs);
    }
  });

  return duplicates;
}
