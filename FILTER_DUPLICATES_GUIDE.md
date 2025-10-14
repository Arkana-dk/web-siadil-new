# 📋 Panduan Filter Dokumen Duplikat

## 🎯 Overview

Sistem ini menyediakan fungsi utility untuk memfilter dokumen yang duplikat **tanpa mengubah sistem yang telah ada**. Fungsi-fungsi ini dapat digunakan secara opsional di mana pun diperlukan.

## 📦 File Location

```
src/lib/filterDuplicates.ts
```

## 🚀 Cara Penggunaan

### 1. Import Fungsi

```typescript
import {
  removeDuplicateDocuments,
  removeDuplicatesByMultipleKeys,
  removeDuplicatesWithPriority,
  removeDuplicateReminders,
  getDuplicateStats,
  findDuplicateDocuments,
} from "@/lib/filterDuplicates";
```

### 2. Contoh Penggunaan Dasar

#### A. Hapus Duplikat Berdasarkan ID (Default)

```typescript
const documents = [
  { id: "1", number: "DOC-001", title: "Doc 1" },
  { id: "1", number: "DOC-001", title: "Doc 1" }, // Duplikat
  { id: "2", number: "DOC-002", title: "Doc 2" },
];

const uniqueDocs = removeDuplicateDocuments(documents);
// Result: 2 dokumen (duplikat ID '1' dihapus)
```

#### B. Hapus Duplikat Berdasarkan Number

```typescript
const uniqueDocs = removeDuplicateDocuments(documents, "number");
// Dokumen dengan number yang sama akan dihapus
```

#### C. Hapus Duplikat Berdasarkan Multiple Keys

```typescript
// Dokumen dianggap duplikat jika number DAN title sama
const uniqueDocs = removeDuplicatesByMultipleKeys(documents, [
  "number",
  "title",
]);
```

### 3. Filter dengan Prioritas

Berguna ketika ada duplikat tapi ingin mempertahankan dokumen tertentu:

```typescript
// Pertahankan dokumen dengan updatedDate terbaru
const uniqueDocs = removeDuplicatesWithPriority(
  documents,
  "number",
  (doc1, doc2) => new Date(doc1.updatedDate) > new Date(doc2.updatedDate)
);

// Pertahankan dokumen yang starred
const uniqueDocsStarred = removeDuplicatesWithPriority(
  documents,
  "number",
  (doc1, doc2) => doc1.isStarred && !doc2.isStarred
);
```

### 4. Filter Reminders Duplikat

```typescript
const reminders = [
  { id: "1", title: "Reminder 1", type: "error" },
  { id: "1", title: "Reminder 1", type: "error" }, // Duplikat
];

const uniqueReminders = removeDuplicateReminders(reminders);
// atau berdasarkan documentId
const uniqueByDoc = removeDuplicateReminders(reminders, "documentId");
```

### 5. Debugging & Statistics

```typescript
// Dapatkan statistik duplikasi
const stats = getDuplicateStats(documents, "number");
console.log(`Total: ${stats.total}`);
console.log(`Unique: ${stats.unique}`);
console.log(`Duplicates: ${stats.duplicates}`);
console.log(`Duplicate Keys:`, stats.duplicateKeys);

// Temukan dokumen yang duplikat
const duplicates = findDuplicateDocuments(documents, "number");
duplicates.forEach((docs, key) => {
  console.log(`Dokumen dengan number ${key} muncul ${docs.length} kali:`, docs);
});
```

## 🔧 Implementasi di Sistem Yang Ada

### Option 1: Apply di Hook useData

Jika ingin filter duplikat secara global untuk semua dokumen:

```typescript
// src/app/dashboard/siadil/hooks/useData.ts
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";

// Setelah fetch documents dari API
const fetchedDocuments = await fetchDocumentsFromAPI();
const uniqueDocuments = removeDuplicateDocuments(fetchedDocuments, "id");
setDocuments(uniqueDocuments);
```

### Option 2: Apply di Component Tertentu

Hanya filter di component yang memerlukan:

```typescript
// Misalnya di HeaderSection atau DocumentView
const uniqueDocuments = useMemo(() => {
  return removeDuplicateDocuments(documents, "number");
}, [documents]);
```

### Option 3: Apply di Pagination

Filter sebelum pagination:

```typescript
// src/app/dashboard/siadil/hooks/useDocumentPagination.ts
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";

const uniqueDocuments = removeDuplicateDocuments(documents, "id");
// Lalu lakukan pagination pada uniqueDocuments
```

### Option 4: Apply Hanya untuk Quick Access

```typescript
// Di QuickAccessSection component
const uniqueQuickAccessDocs = useMemo(() => {
  return removeDuplicateDocuments(quickAccessDocuments, "id");
}, [quickAccessDocuments]);
```

### Option 5: Apply untuk Reminders di Header

```typescript
// Di HeaderSection component
const uniqueReminders = useMemo(() => {
  return removeDuplicateReminders(reminders, "documentId");
}, [reminders]);
```

## 📊 Use Cases

### 1. Filter Documents dari API

```typescript
// Jika API mengembalikan duplikat
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch("/api/documents");
    const data = await response.json();

    // Filter duplikat sebelum set state
    const uniqueDocs = removeDuplicateDocuments(data, "id");
    setDocuments(uniqueDocs);
  };

  fetchData();
}, []);
```

### 2. Merge Data dari Multiple Sources

```typescript
// Jika merge data dari localStorage dan API
const localDocs = getFromLocalStorage("documents");
const apiDocs = await fetchFromAPI();

const allDocs = [...localDocs, ...apiDocs];
const uniqueDocs = removeDuplicatesWithPriority(allDocs, "id", (doc1, doc2) => {
  // Prioritaskan data dari API (lebih baru)
  return doc1.source === "api" && doc2.source === "local";
});
```

### 3. Display Duplicate Warning

```typescript
const stats = getDuplicateStats(documents, "number");

if (stats.duplicates > 0) {
  toast.warning(`Ditemukan ${stats.duplicates} dokumen duplikat!`);
  console.log("Duplicate numbers:", stats.duplicateKeys);
}
```

### 4. Admin Panel untuk Review Duplicates

```typescript
const duplicates = findDuplicateDocuments(documents, "number");

return (
  <div>
    <h2>Duplicate Documents Found: {duplicates.size}</h2>
    {Array.from(duplicates.entries()).map(([key, docs]) => (
      <div key={key}>
        <h3>Document Number: {key}</h3>
        <p>Found {docs.length} times:</p>
        <ul>
          {docs.map((doc) => (
            <li key={doc.id}>
              {doc.title} (Updated: {doc.updatedDate})
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);
```

## 🎨 Contoh Implementasi Lengkap

### Di page.tsx (Optional Global Filter)

```typescript
// src/app/dashboard/siadil/page.tsx
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";

export default function SiadilPage() {
  // ... existing code ...

  const {
    archives,
    documents,
    setDocuments,
    // ... other states
  } = useData({
    onArchivesUpdate: () => {},
    onDocumentsUpdate: () => {},
  });

  // Optional: Filter duplikat secara global
  const uniqueDocuments = useMemo(() => {
    return removeDuplicateDocuments(documents, "id");
  }, [documents]);

  // Gunakan uniqueDocuments di komponen children
  // atau tetap gunakan documents jika tidak perlu filter
}
```

### Di HeaderSection.tsx

```typescript
// src/app/dashboard/siadil/components/container/HeaderSection.tsx
import { removeDuplicateReminders } from "@/lib/filterDuplicates";

const HeaderSection: React.FC<HeaderSectionProps> = ({
  reminders,
  // ... other props
}) => {
  // Optional: Filter duplicate reminders
  const uniqueReminders = useMemo(() => {
    return removeDuplicateReminders(reminders, "documentId");
  }, [reminders]);

  // Gunakan uniqueReminders alih-alih reminders
  // atau tetap gunakan reminders jika tidak perlu filter
};
```

## ⚠️ Important Notes

1. **Non-Invasive**: Fungsi-fungsi ini tidak mengubah sistem yang ada, hanya menambahkan kemampuan optional
2. **Performance**: Untuk dataset besar, gunakan dengan `useMemo` untuk menghindari re-computation
3. **Flexibility**: Bisa diterapkan di level manapun (global, component, atau per-feature)
4. **Debugging**: Gunakan `getDuplicateStats` dan `findDuplicateDocuments` untuk monitoring

## 🧪 Testing

### Test Basic Functionality

```typescript
const testDocs = [
  { id: "1", number: "DOC-001", title: "Test 1" },
  { id: "1", number: "DOC-001", title: "Test 1" },
  { id: "2", number: "DOC-002", title: "Test 2" },
];

// Test 1: Remove by ID
const unique1 = removeDuplicateDocuments(testDocs);
console.assert(unique1.length === 2, "Should remove ID duplicates");

// Test 2: Remove by number
const unique2 = removeDuplicateDocuments(testDocs, "number");
console.assert(unique2.length === 2, "Should remove number duplicates");

// Test 3: Stats
const stats = getDuplicateStats(testDocs, "id");
console.assert(stats.duplicates === 1, "Should count 1 duplicate");
```

## 📝 Summary

Sistem filter duplikat ini:

- ✅ **Tidak mengubah** sistem yang telah ada
- ✅ **Fleksibel** - bisa digunakan di mana saja
- ✅ **Opsional** - bisa aktifkan/nonaktifkan kapan saja
- ✅ **Type-safe** - full TypeScript support
- ✅ **Powerful** - mendukung berbagai strategi filtering
- ✅ **Debuggable** - dengan tools untuk monitoring

Anda bisa menggunakan fungsi-fungsi ini kapan saja sesuai kebutuhan tanpa khawatir merusak sistem yang sudah berjalan! 🎉
