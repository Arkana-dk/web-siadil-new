# 🐛 Archive & Reminder Count Issues - Troubleshooting

## 📋 Masalah yang Dilaporkan

### 1. **Archives menampilkan 0 item semua**

```
❌ Archive A: 0 documents
❌ Archive B: 0 documents
❌ Archive C: 0 documents
Padahal ada 1000 dokumen total
```

### 2. **Card "Will Expire" inconsistent**

```
❌ Card tampil: 1 document
❌ Modal tampil: 5 documents
Seharusnya sama!
```

### 3. **Archive & Documents tidak saling terkait**

```
❌ User Kang Dwi: Documents tidak terhubung ke Archives
```

---

## 🔍 Root Cause Analysis

### Masalah #1: Archives 0 Item

**Kemungkinan penyebab:**

#### A. **Archive ID tidak match**

```typescript
// Data dari API:
document.id_archive = 78       // number
archive.id = "78"              // string

// Logic kita:
doc.parentId === arc.id
String(78) === "78"  // ✅ Harusnya match

// Tapi kalau archives belum loaded:
archives.length = 0
→ Semua docs tidak ketemu archive-nya
→ Count = 0
```

#### B. **Archives belum ter-fetch**

```typescript
// usePersistentArchives masih loading
archives = [];

// archiveDocCounts runs
documents.forEach((doc) => {
  const archive = archives.find((a) => a.id === doc.parentId);
  // archive = undefined (karena archives kosong)
  // Count tidak bertambah
});
```

#### C. **Archive parentId tidak di-set**

```typescript
// Transform dari API:
parentId: String(item.id_archive)

// Kalau item.id_archive = null/undefined:
parentId: "null" atau "undefined"
// Tidak akan match dengan archive.id
```

---

### Masalah #2: Reminder Count Inconsistent

**Root cause:**

```typescript
// BEFORE (SALAH):
const shouldSurfaceReminder =
  doc.reminderActive || // ← Bisa true tapi tidak expired/expiring!
  doc.reminderSource === "derived" ||
  isExpired ||
  isExpiringSoon;

// Hasil:
// - Count hanya hitung isExpired + isExpiringSoon = 1
// - Tapi reminders array include reminderActive = 5
// - Inconsistent! ❌
```

**Logic yang benar:**

```typescript
// AFTER (BENAR):
// Hitung count
if (isExpired) expired++;
if (isExpiringSoon) expiringSoon++;

// Surface reminder HANYA untuk yang benar-benar expired/expiring
const shouldSurfaceReminder = isExpired || isExpiringSoon;

// Hasil:
// - Count = expired + expiringSoon
// - Reminders array = hanya yang expired/expiring
// - Consistent! ✅
```

---

## ✅ Solusi yang Diterapkan

### Fix #1: Debug Logging untuk Archives

**File: `src/app/dashboard/siadil/hooks/useData.ts`**

```typescript
const archiveDocCounts = useMemo(() => {
  const counts = documents
    .filter((doc) => doc.status !== "Trashed")
    .reduce((acc, doc) => {
      const parentArchive = archives.find((a) => a.id === doc.parentId);
      if (parentArchive) {
        acc[parentArchive.code] = (acc[parentArchive.code] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

  // 🔍 DEBUG logging
  console.log("📊 Archive Document Counts:");
  console.log("   - Total archives:", archives.length);
  console.log(
    "   - Total active documents:",
    documents.filter((d) => d.status !== "Trashed").length
  );
  console.log("   - Archives with docs:", Object.keys(counts).length);
  console.log("   - Sample counts:", Object.entries(counts).slice(0, 5));

  // Check documents without matching archive
  const docsWithoutArchive = documents.filter((doc) => {
    const hasArchive = archives.find((a) => a.id === doc.parentId);
    return !hasArchive && doc.status !== "Trashed";
  });

  if (docsWithoutArchive.length > 0) {
    console.warn(
      "   ⚠️ Documents without matching archive:",
      docsWithoutArchive.length
    );
    console.warn("   ⚠️ Sample doc:", {
      id: docsWithoutArchive[0].id,
      title: docsWithoutArchive[0].title,
      parentId: docsWithoutArchive[0].parentId,
      archive: docsWithoutArchive[0].archive,
    });
  }

  return counts;
}, [documents, archives]);
```

### Fix #2: Reminder Count Logic

**File: `src/app/dashboard/siadil/page.tsx`**

```typescript
// OLD (WRONG):
const shouldSurfaceReminder =
  doc.reminderActive || // ❌ Bisa include yang tidak expired/expiring
  doc.reminderSource === "derived" ||
  isExpired ||
  isExpiringSoon;

// NEW (CORRECT):
const shouldSurfaceReminder = isExpired || isExpiringSoon; // ✅ Hanya yang benar-benar perlu reminder
```

**Logging untuk debug:**

```typescript
console.log("🔔 Reminders Summary:");
console.log("   - Total base documents:", baseDocs.length);
console.log("   - Expired count:", expired);
console.log("   - Expiring soon count:", expiringSoon);
console.log("   - Total reminders:", reminders.length);
console.log(
  "   - Expired reminders:",
  reminders.filter((r) => r.type === "error").length
);
console.log(
  "   - Warning reminders:",
  reminders.filter((r) => r.type === "warning").length
);
```

### Fix #3: Document-Archive Mapping Debug

**File: `src/app/dashboard/siadil/data.ts`**

```typescript
// Log sample documents dengan archive mapping
if (documentsData.length > 0) {
  console.log("   📄 Sample documents:");
  documentsData
    .slice(0, 3)
    .forEach((item: DemplonDocumentItem, idx: number) => {
      console.log(
        `      ${idx + 1}. "${item.title?.substring(0, 40)}" → Archive ID: ${
          item.id_archive
        } (${item.archive?.code})`
      );
    });
}
```

---

## 🧪 Debug Steps

### Step 1: Check Console Log

**Hard refresh** browser dan cek console:

```javascript
// Expected logs setelah login:

// 1. Archives loading
🌲 Attempting to fetch Archives Tree API...
✅ Archives Tree API loaded successfully!
   - Total archives: XX

// 2. Documents loading
📊 Documents Summary:
   - Reminder documents: 174
   - All documents: 1000
   - Total unique documents: 1000

// 3. Sample document mapping
   📄 Sample documents:
      1. "Sertifikat Merk Pupuk Kujang" → Archive ID: 78 (SERTIFIKAT MEREK)
      2. "Sertifikat Halal" → Archive ID: 1681 (PERIZINAN)
      3. ...

// 4. Archive counts
📊 Archive Document Counts:
   - Total archives: 50
   - Total active documents: 1000
   - Archives with docs: 45
   - Sample counts: [["SERTIFIKAT MEREK", 15], ["PERIZINAN", 32], ...]

// 5. Reminder counts
🔔 Reminders Summary:
   - Total base documents: 1000
   - Expired count: 120
   - Expiring soon count: 25
   - Total reminders: 145
```

### Step 2: Verify Archive-Document Relation

**Cek apakah ada warning:**

```
⚠️ Documents without matching archive: 100
⚠️ Sample doc: {
  id: "12345",
  title: "Test Doc",
  parentId: "999",   ← Archive ID yang tidak ada
  archive: "UNKNOWN"
}
```

**Kalau ada warning ini:**

- Documents punya `parentId` yang tidak match dengan `archive.id`
- Possible causes:
  - Archives belum ter-fetch lengkap
  - Document `id_archive` dari API salah/null
  - Transform string ID tidak konsisten

### Step 3: Check Archive List

**Di UI, buka folder archives dan cek:**

```
✅ Archive A: 15 documents   ← Seharusnya ada angka
✅ Archive B: 32 documents
✅ Archive C: 8 documents
```

**Kalau masih 0 semua:**

1. Cek `archives.length` di console (harusnya > 0)
2. Cek `documents.length` di console (harusnya > 0)
3. Cek log "Archives with docs" (harusnya > 0)

### Step 4: Check Reminder Cards

**Di header cards:**

```
✅ Expired: 120         ← Angka dari console log
✅ Will Expire: 25      ← Angka dari console log
```

**Click card:**

- Modal harusnya muncul dengan **120** reminders (expired)
- Modal harusnya muncul dengan **25** reminders (expiring soon)
- **ANGKA HARUS SAMA** dengan card! ✅

---

## 🎯 Expected Results

### ✅ Setelah Refresh:

**Console:**

```
✅ Archives loaded: 50
✅ Documents loaded: 1000
✅ Documents with archive: 900
✅ Documents without archive: 100 (warning logged)
✅ Expired count: 120
✅ Expiring soon count: 25
✅ Total reminders: 145 (120 + 25)
```

**UI:**

```
✅ Archive A: 15 docs (bukan 0)
✅ Archive B: 32 docs (bukan 0)
✅ Expired card: 120 (sama dengan modal)
✅ Will Expire card: 25 (sama dengan modal)
```

---

## 🐛 Troubleshooting Scenarios

### Scenario 1: Archives masih 0 semua

**Check:**

```javascript
// Di console, cek:
archives.length; // Harusnya > 0
documents.length; // Harusnya > 0
```

**Kalau archives.length = 0:**

- Archives API belum berhasil fetch
- Cek network tab, apakah ada error 403/400
- Cek token valid
- Cek VPN (kalau perlu)

**Kalau documents.length = 0:**

- Documents API belum berhasil fetch
- Same troubleshooting dengan archives

### Scenario 2: Ada archives, tapi count tetap 0

**Check console log:**

```
⚠️ Documents without matching archive: 1000
```

**Possible causes:**

- `parentId` format salah (number vs string)
- `archive.id` format salah
- Transform `String(item.id_archive)` menghasilkan "null" atau "undefined"

**Fix:**
Cek log sample documents - apakah `id_archive` ada nilainya?

### Scenario 3: Card count ≠ Modal count

**Sudah diperbaiki!** Sekarang logic konsisten:

```typescript
// Count hanya hitung expired + expiringSoon
// Reminders array hanya include expired + expiringSoon
// HARUS SAMA! ✅
```

**Kalau masih berbeda:**

- Clear localStorage: `localStorage.clear()`
- Hard refresh
- Check console log untuk nilai yang tepat

---

## 📝 Summary

### Fixes Applied:

1. ✅ **Debug logging untuk Archives**

   - Log total archives
   - Log total documents
   - Log documents without matching archive
   - Identify masalah relasi

2. ✅ **Fix reminder count logic**

   - Hanya surface reminders yang benar-benar expired/expiring
   - Consistent count antara card dan modal
   - Remove logic `reminderActive` yang bikin inconsistent

3. ✅ **Debug logging untuk Documents**
   - Log sample document-archive mapping
   - Verify `id_archive` ada nilai
   - Verify transform ke `parentId` benar

### Next Steps:

1. **Refresh browser** (Ctrl+Shift+R)
2. **Clear cache**: `localStorage.clear()`
3. **Login ulang**
4. **Check console logs** - ikuti expected logs di atas
5. **Verify UI** - archives ada angka, cards consistent

**Kalau masih ada masalah, screenshot console log-nya ya! 🔍**
