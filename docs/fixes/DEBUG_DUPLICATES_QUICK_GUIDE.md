# 🔍 Quick Debug Guide - Duplicate Documents

## 🚨 Error Masih Muncul?

Jika masih melihat error "Encountered two children with the same key", ikuti langkah-langkah ini:

---

## 1️⃣ Identifikasi Key yang Duplikat

### Dari Console Error:

```
Encountered two children with the same key, `93492`
                                            ^^^^^^
                                            ID ini yang duplikat
```

### Manual Check di Console:

```javascript
// Paste ini di Browser Console
const documents = // your documents array
const ids = documents.map(d => d.id);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('Duplicate IDs:', duplicates);
```

---

## 2️⃣ Cek Komponen Mana yang Error

### Dari Stack Trace:

```
at QuickAccessSection (src\app\dashboard\siadil\components\views\QuickAccessSection.tsx:149:13)
   ^^^^^^^^^^^^^^^^^^^
   Component ini yang error
```

### Komponen yang Sudah Di-fix:

- ✅ QuickAccessSection
- ✅ HeaderSection
- ✅ ViewAllQuickAccessModal
- ✅ DocumentTable
- ✅ DocumentGrid

### Komponen yang Mungkin Perlu Di-fix:

- ❓ TrashView
- ❓ StarredView
- ❓ AllRemindersModal
- ❓ SearchPopup
- ❓ AllHistoryModal
- ❓ GlobalSearch

---

## 3️⃣ Apply Fix ke Komponen

### Template Fix:

```typescript
// 1. Import
import { useMemo } from "react";
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";

// 2. Di dalam component, tambahkan:
const uniqueDocuments = useMemo(() => {
  return removeDuplicateDocuments(documents, "id");
}, [documents]);

// 3. Ganti semua `documents.map` dengan `uniqueDocuments.map`
// BEFORE:
{documents.map((doc) => ...)}

// AFTER:
{uniqueDocuments.map((doc) => ...)}
```

---

## 4️⃣ Verify Fix

### A. Check Console

```bash
# Clear console
Ctrl + L (or Cmd + K on Mac)

# Refresh page
F5 (or Cmd + R on Mac)

# Check for errors
Look for: "Encountered two children with the same key"
```

### B. Use getDuplicateStats

```typescript
import { getDuplicateStats } from "@/lib/filterDuplicates";

// Add ini di component untuk debugging
useEffect(() => {
  const stats = getDuplicateStats(documents, "id");
  if (stats.duplicates > 0) {
    console.warn("🔴 DUPLICATES FOUND:", {
      total: stats.total,
      unique: stats.unique,
      duplicates: stats.duplicates,
      duplicateIds: stats.duplicateKeys,
    });
  } else {
    console.log("✅ No duplicates");
  }
}, [documents]);
```

---

## 5️⃣ Troubleshooting

### Problem: Filter tidak bekerja

**Solution:**

```typescript
// Check apakah useMemo digunakan
const uniqueDocuments = useMemo(() => {
  return removeDuplicateDocuments(documents, "id");
}, [documents]); // ← Pastikan dependency array benar

// Check apakah uniqueDocuments digunakan di render
{uniqueDocuments.map(...)}  // ✅ Correct
{documents.map(...)}         // ❌ Wrong, masih pakai documents
```

### Problem: Import error

**Solution:**

```typescript
// Check path import benar
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";
//                                        ^^^^^^^^^^^^^^^^^^^^^^^^
//                                        Path harus exact seperti ini

// Pastikan file ada di:
// src/lib/filterDuplicates.ts
```

### Problem: TypeScript error

**Solution:**

```typescript
// Pastikan import useMemo dari react
import { useMemo } from "react";

// Bukan dari tempat lain
import React, { useMemo } from "react"; // ✅ OK
```

---

## 6️⃣ Quick Fix untuk Komponen Belum Di-fix

### TrashView.tsx

```typescript
import { useMemo } from "react";
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";

const TrashView = ({ documents, ... }) => {
  const uniqueDocuments = useMemo(() =>
    removeDuplicateDocuments(documents, "id"),
    [documents]
  );

  // Use uniqueDocuments instead of documents
};
```

### StarredView.tsx

```typescript
const uniqueDocuments = useMemo(
  () => removeDuplicateDocuments(documents, "id"),
  [documents]
);
```

### AllRemindersModal.tsx

```typescript
const uniqueReminders = useMemo(
  () => removeDuplicateReminders(reminders, "documentId"),
  [reminders]
);
```

---

## 7️⃣ Testing Checklist

Setelah apply fix:

- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Open console (F12)
- [ ] Check for errors
- [ ] Navigate to problematic section
- [ ] Verify no duplicate items displayed
- [ ] Check console again
- [ ] Test interactions (click, hover, etc)

---

## 8️⃣ Performance Check

### Check Render Count:

```typescript
useEffect(() => {
  console.log("Component rendered, docs count:", documents.length);
  console.log("Unique docs count:", uniqueDocuments.length);
}, [documents, uniqueDocuments]);
```

### Check Filter Time:

```typescript
const uniqueDocuments = useMemo(() => {
  console.time("Filter duplicates");
  const result = removeDuplicateDocuments(documents, "id");
  console.timeEnd("Filter duplicates");
  return result;
}, [documents]);
```

---

## 9️⃣ Common Issues & Solutions

### Issue: "Cannot find module '@/lib/filterDuplicates'"

**Solution:**

```typescript
// Try different import paths:
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";
// or
import { removeDuplicateDocuments } from "../../lib/filterDuplicates";
// or
import { removeDuplicateDocuments } from "../../../lib/filterDuplicates";
```

### Issue: "uniqueDocuments is not defined"

**Solution:**

```typescript
// Make sure useMemo is called inside component
const MyComponent = ({ documents }) => {
  const uniqueDocuments = useMemo(...); // ✅ Inside component

  return (...);
};

// Not outside
const uniqueDocuments = useMemo(...); // ❌ Outside
const MyComponent = () => { ... };
```

### Issue: Still seeing duplicates in UI

**Solution:**

```typescript
// Double check all .map calls use uniqueDocuments
// Search in file for: "documents.map"
// Replace with: "uniqueDocuments.map"

// Or use global find & replace:
// Find: documents.map
// Replace: uniqueDocuments.map
// ⚠️ Except in props destructuring!
```

---

## 🔟 Emergency Rollback

If something breaks:

### Step 1: Comment out filter

```typescript
// const uniqueDocuments = useMemo(() => {
//   return removeDuplicateDocuments(documents, "id");
// }, [documents]);
```

### Step 2: Revert variable usage

```typescript
// Change back
{uniqueDocuments.map(...)}  // Change this
// To
{documents.map(...)}         // Back to this
```

### Step 3: Remove import

```typescript
// import { removeDuplicateDocuments } from "@/lib/filterDuplicates";
```

### Step 4: Test

- Refresh browser
- Check if error gone
- If yes, fix was problematic
- If no, error was from something else

---

## 📊 Monitoring Tools

### Add Debug Panel (Development Only):

```typescript
{
  process.env.NODE_ENV === "development" && (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded shadow-lg z-50">
      <h4 className="font-bold">Debug Info</h4>
      <p>Total docs: {documents.length}</p>
      <p>Unique docs: {uniqueDocuments.length}</p>
      <p>Duplicates: {documents.length - uniqueDocuments.length}</p>
    </div>
  );
}
```

### Add Stats Logger:

```typescript
useEffect(() => {
  const stats = getDuplicateStats(documents, "id");
  if (stats.duplicates > 0) {
    console.table({
      "Total Documents": stats.total,
      "Unique Documents": stats.unique,
      "Duplicate Count": stats.duplicates,
    });
  }
}, [documents]);
```

---

## ✅ Success Indicators

Fix berhasil jika:

1. ✅ Tidak ada error di console
2. ✅ Tidak ada warning tentang duplicate keys
3. ✅ UI menampilkan jumlah dokumen yang benar
4. ✅ Tidak ada item yang tampil 2x
5. ✅ Performance tidak menurun
6. ✅ All interactions work normally

---

## 📞 Need Help?

1. Check `FIX_DUPLICATE_DOCUMENTS_COMPLETE.md` untuk detail implementasi
2. Check `FILTER_DUPLICATES_GUIDE.md` untuk panduan lengkap
3. Check `EXAMPLE_FILTER_DUPLICATES_USAGE.tsx` untuk contoh kode
4. Ask me! 😊

---

**Quick Tip:** Jika masih bingung, coba compare dengan file yang sudah di-fix:

- ✅ `QuickAccessSection.tsx` - Best example
- ✅ `HeaderSection.tsx` - For reminders
- ✅ `DocumentTable.tsx` - For table view

Copy pattern dari file-file ini! 🎯
