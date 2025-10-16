# ✅ Checklist Implementasi Filter Duplikat

## 📋 Checklist Sebelum Implementasi

- [ ] Baca `FILTER_DUPLICATES_README.md` untuk overview
- [ ] Buka browser DevTools Console untuk monitoring
- [ ] Backup file yang akan dimodifikasi (optional)
- [ ] Tentukan di mana akan mengimplementasikan filter

---

## 🎯 Pilih Lokasi Implementasi

Pilih salah satu atau beberapa:

- [ ] **Global Filter** - Di `useData` hook
- [ ] **Component Filter** - Di HeaderSection
- [ ] **Feature Filter** - Di QuickAccessSection
- [ ] **Page Filter** - Di page.tsx

---

## 🚀 Implementasi: HeaderSection (Recommended untuk Mulai)

### Step 1: Import

- [ ] Buka `src/app/dashboard/siadil/components/container/HeaderSection.tsx`
- [ ] Tambahkan import di bagian atas:

```typescript
import { removeDuplicateReminders } from "@/lib/filterDuplicates";
```

### Step 2: Tambahkan Filter Logic

- [ ] Cari function `HeaderSection`
- [ ] Tambahkan setelah `useState` declarations:

```typescript
const uniqueReminders = useMemo(
  () => removeDuplicateReminders(reminders, "documentId"),
  [reminders]
);
```

### Step 3: Replace Penggunaan

- [ ] Find & Replace `reminders.length` → `uniqueReminders.length`
- [ ] Find & Replace `reminders[` → `uniqueReminders[`
- [ ] Find & Replace `reminders.map` → `uniqueReminders.map`
- [ ] **KECUALI:** Jangan replace di props destructuring dan dependency array yang sudah ada

### Step 4: Test

- [ ] Save file
- [ ] Refresh browser
- [ ] Buka Console dan check tidak ada error
- [ ] Verify reminders masih tampil dengan baik

### Step 5: Optional - Add Logging

- [ ] Tambahkan untuk monitoring:

```typescript
useEffect(() => {
  if (reminders.length !== uniqueReminders.length) {
    console.log(
      `🔄 Filtered ${
        reminders.length - uniqueReminders.length
      } duplicate reminders`
    );
  }
}, [reminders, uniqueReminders]);
```

---

## 🚀 Implementasi: useData Hook (Global Filter)

### Step 1: Locate Hook

- [ ] Buka `src/app/dashboard/siadil/hooks/useData.ts`
- [ ] Cari function yang handle documents update

### Step 2: Import

- [ ] Tambahkan import:

```typescript
import {
  removeDuplicateDocuments,
  getDuplicateStats,
} from "@/lib/filterDuplicates";
```

### Step 3: Apply Filter

- [ ] Cari di mana `setDocuments` dipanggil
- [ ] Sebelum `setDocuments`, tambahkan:

```typescript
const uniqueDocs = removeDuplicateDocuments(fetchedDocuments, "id");
setDocuments(uniqueDocs);
```

### Step 4: Optional - Add Stats

- [ ] Tambahkan monitoring:

```typescript
const stats = getDuplicateStats(fetchedDocuments, "id");
if (stats.duplicates > 0) {
  console.warn(`⚠️ Removed ${stats.duplicates} duplicate documents`);
}
```

### Step 5: Test

- [ ] Save file
- [ ] Refresh browser dan clear cache
- [ ] Check Console untuk stats
- [ ] Verify documents masih tampil dengan baik

---

## 🚀 Implementasi: Page Level

### Step 1: Open Page

- [ ] Buka `src/app/dashboard/siadil/page.tsx`

### Step 2: Import

- [ ] Tambahkan import:

```typescript
import { removeDuplicateDocuments } from "@/lib/filterDuplicates";
```

### Step 3: Add Filter

- [ ] Setelah `useData` hook, tambahkan:

```typescript
const uniqueDocuments = useMemo(
  () => removeDuplicateDocuments(documents, "id"),
  [documents]
);
```

### Step 4: Update Component Props

- [ ] Pass `uniqueDocuments` ke child components alih-alih `documents`
- [ ] Update semua component yang menerima documents

### Step 5: Test

- [ ] Save file
- [ ] Refresh browser
- [ ] Verify semua component masih berfungsi

---

## 🧪 Testing Checklist

### Functional Testing

- [ ] Reminders masih tampil dengan baik
- [ ] Documents masih tampil dengan baik
- [ ] Quick Access masih berfungsi
- [ ] Pagination masih berfungsi
- [ ] Search masih berfungsi
- [ ] Filter masih berfungsi

### Visual Testing

- [ ] UI tidak ada yang rusak
- [ ] Animations masih smooth
- [ ] Hover effects masih berfungsi
- [ ] Responsive design masih OK

### Console Testing

- [ ] Tidak ada error di console
- [ ] Logging menampilkan informasi yang benar
- [ ] Stats menunjukkan angka yang masuk akal

### Performance Testing

- [ ] Loading time masih acceptable
- [ ] No lag saat scroll
- [ ] No lag saat interact

---

## 🔍 Debugging Checklist

Jika ada masalah:

### Check Import

- [ ] Import path benar: `@/lib/filterDuplicates`
- [ ] Import statement lengkap dan benar
- [ ] File `filterDuplicates.ts` ada di `src/lib/`

### Check Implementation

- [ ] `useMemo` digunakan dengan benar
- [ ] Dependency array benar
- [ ] Variable name tidak konflik

### Check Usage

- [ ] Semua referensi ke variable asli sudah diganti
- [ ] Tidak ada variable yang undefined
- [ ] Props masih di-pass dengan benar

### Check Console

- [ ] Lihat error message lengkap
- [ ] Check stack trace
- [ ] Look for typos

---

## 📊 Monitoring Checklist

### Setelah Implementasi

- [ ] Monitor console untuk duplicate stats
- [ ] Check berapa banyak duplikat yang difilter
- [ ] Verify data yang ditampilkan benar

### Setup Monitoring (Optional)

- [ ] Tambahkan logging di strategic points
- [ ] Setup toast notifications jika perlu
- [ ] Create debug panel jika perlu

---

## 🎯 Production Checklist

Sebelum deploy ke production:

- [ ] Test di development environment
- [ ] Test di staging environment (jika ada)
- [ ] Remove console.log yang tidak perlu
- [ ] Verify performance OK
- [ ] Update documentation jika perlu
- [ ] Inform team tentang perubahan

---

## 📝 Post-Implementation

### Documentation

- [ ] Update internal docs jika perlu
- [ ] Document any issues found
- [ ] Document solutions applied

### Team Communication

- [ ] Inform team tentang feature baru
- [ ] Share documentation dengan team
- [ ] Provide training jika perlu

---

## 🆘 Rollback Checklist

Jika perlu rollback:

- [ ] Comment out import statement
- [ ] Comment out filter logic (useMemo)
- [ ] Revert semua penggunaan variable (uniqueX → X)
- [ ] Test untuk ensure sistem kembali normal
- [ ] Document why rollback was needed

---

## ✨ Success Criteria

Implementasi dianggap berhasil jika:

- [x] ✅ Sistem berjalan tanpa error
- [x] ✅ UI tampil dengan baik
- [x] ✅ Duplikat berhasil difilter
- [x] ✅ Performance masih baik
- [x] ✅ User experience tidak terganggu

---

## 📞 Need Help?

Jika stuck atau butuh bantuan:

1. Check dokumentasi lengkap di:

   - `FILTER_DUPLICATES_README.md`
   - `FILTER_DUPLICATES_GUIDE.md`

2. Check contoh implementasi di:

   - `EXAMPLE_FILTER_DUPLICATES_USAGE.tsx`
   - `IMPLEMENTATION_HEADERSECTION.tsx`

3. Use debugging tools:

   - `getDuplicateStats()` untuk stats
   - `findDuplicateDocuments()` untuk detail
   - Browser DevTools Console

4. Tanya saya! 😊

---

## 🎉 Selesai!

Setelah semua checklist ini complete, sistem filter duplikat sudah siap dan berfungsi dengan baik!

**Happy Coding! 🚀**
