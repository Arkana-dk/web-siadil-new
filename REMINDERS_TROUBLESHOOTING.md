# 🔍 Reminders Troubleshooting Guide

## ❓ Masalah: Reminders Kosong (Expired = 0, Will Expire = 0)

### Screenshot Kondisi:

```
✅ Documents: 1000  ← Data berhasil dimuat
❌ Expired: 0       ← Harusnya ada angka
❌ Will Expire: 0   ← Harusnya ada angka
❌ Reminders: "Semua Dokumen Aman! 🎉"  ← Kosong
```

### 🎯 Root Cause Analysis

**Ada 3 kemungkinan:**

#### 1️⃣ **Dokumen TIDAK punya `document_expire_date`** (PALING MUNGKIN)

- Data dari Demplon API tidak mengisi field `document_expire_date`
- Semua dokumen punya `document_expire_date = null` atau kosong
- **Akibat:** Tidak ada dokumen yang di-track sebagai reminder

#### 2️⃣ **User tidak punya akses ke dokumen dengan expire date**

- User ID 666 hanya bisa akses dokumen tertentu
- Dokumen yang dia akses kebetulan tidak ada yang punya expire date
- **Akibat:** Dari 1000 dokumen, tidak ada satupun yang perlu reminder

#### 3️⃣ **Semua dokumen memang belum ada yang expire/akan expire**

- Data dokumen ada `document_expire_date`
- Tapi semua tanggal expire-nya masih > 30 hari ke depan
- **Akibat:** Reminders tidak muncul (by design)

---

## 🔍 Debug Steps

### Step 1: Cek Console Log di Browser

**Hard Refresh** browser (Ctrl+Shift+R) dan login ulang, lalu cek console:

```javascript
// Harusnya muncul log seperti ini:
📦 API Response received:
   - Total documents: 1000
   - First document: {id: "...", title: "...", ...}
   - Documents with expireDate: X  ← CEK ANGKA INI!

🔍 Documents with document_expire_date: X / 1000  ← CEK INI!
```

**Interpretasi:**

- `Documents with expireDate: 0` → **Masalah #1: Data tidak ada expire date**
- `Documents with expireDate: 150` → Data OK, tapi mungkin belum expire/expiring

### Step 2: Cek Server Log (Terminal npm run dev)

```bash
# Di terminal tempat npm run dev jalan, cari log ini:
✅ Successfully fetched 1000 documents (total: 1000)
🔍 Documents with document_expire_date: X / 1000  ← CEK INI!
📅 Sample document with expire date: {...}  ← Ada atau tidak?
```

**Kalau muncul:**

```
⚠️ WARNING: NO documents have document_expire_date field!
⚠️ This means ALL reminders will be empty!
```

→ **KONFIRMASI: Data Demplon tidak punya expire date!**

### Step 3: Manual Test API Demplon

Test langsung ke API Demplon (gunakan token dari session):

```bash
# Copy token dari console log
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Test API
curl -H "Authorization: Bearer $TOKEN" \
  "https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=10&reminder_active=false"
```

**Cek response:**

```json
{
  "data": [
    {
      "id": 12345,
      "title": "Dokumen Test",
      "document_expire_date": "2025-12-31",  ← ADA atau NULL?
      "reminder": true,
      "reminder_active": true
    }
  ]
}
```

**Kalau `document_expire_date: null` atau tidak ada field-nya:**
→ **Masalah di database Demplon, bukan di aplikasi kita!**

---

## ✅ Solusi Berdasarkan Root Cause

### Solusi #1: Data Memang Tidak Ada Expire Date

**Ini bukan bug aplikasi, tapi kondisi data!**

**Langkah yang perlu dilakukan:**

1. **Konfirmasi dengan Tim Demplon/Database:**

   - Apakah dokumen-dokumen di database punya field `document_expire_date`?
   - Apakah field ini diisi oleh user saat upload dokumen?
   - Apakah ada dokumen yang SEHARUSNYA punya expire date?

2. **Input Data Manual (Temporary):**

   - Login ke admin Demplon
   - Edit beberapa dokumen
   - Set `document_expire_date` untuk testing
   - Contoh: Set 5 dokumen expire besok, 3 dokumen expire bulan depan

3. **Update Proses Input:**
   - Pastikan form upload dokumen ada field "Tanggal Kedaluwarsa"
   - Wajibkan user isi expire date untuk dokumen tertentu (sertifikat, kontrak, dll)

### Solusi #2: Tampilkan Reminder Alternatif

Kalau memang data tidak ada expire date, kita bisa tambahkan reminder berdasarkan kriteria lain:

**Contoh kriteria:**

- Dokumen yang sudah lama tidak diupdate (> 1 tahun)
- Dokumen dengan status "Pending Review"
- Dokumen dengan tag "Important" atau "Urgent"

**Implementasi:**

```typescript
// Di page.tsx, tambahkan logic:
baseDocs.forEach((doc) => {
  // Kriteria 1: Dokumen lama tidak diupdate
  const updatedDate = new Date(doc.updatedDate);
  const daysSinceUpdate = Math.floor(
    (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate > 365) {
    reminders.push({
      id: doc.id,
      documentId: doc.id,
      title: doc.title,
      message: `Belum diupdate sejak ${daysSinceUpdate} hari yang lalu`,
      type: "warning",
    });
  }

  // Kriteria 2: Status pending
  if (doc.status === "Pending Review") {
    reminders.push({
      id: doc.id,
      documentId: doc.id,
      title: doc.title,
      message: "Menunggu review",
      type: "warning",
    });
  }
});
```

### Solusi #3: Test dengan Data Mock

Untuk testing UI, kita bisa inject mock data:

```typescript
// Di usePersistentDocuments.ts (temporary untuk testing):
if (process.env.NODE_ENV === "development" && apiDocuments.length > 0) {
  // Inject 5 dokumen dengan expire date untuk testing
  const mockExpiredDocs = apiDocuments.slice(0, 2).map((doc) => ({
    ...doc,
    expireDate: "2025-01-01", // Sudah expired
    documentExpired: true,
    reminderActive: true,
  }));

  const mockExpiringSoonDocs = apiDocuments.slice(2, 5).map((doc) => ({
    ...doc,
    expireDate: "2025-11-15", // Expire dalam 5 hari
    documentExpired: false,
    reminderActive: true,
  }));

  const combinedDocs = [
    ...mockExpiredDocs,
    ...mockExpiringSoonDocs,
    ...apiDocuments.slice(5),
  ];
  console.log("🧪 TEST MODE: Injected mock expire dates");
  setDocuments(combinedDocs);
  return;
}
```

---

## 📊 Expected Data Structure

**Untuk reminder berfungsi, dokumen harus punya:**

```typescript
{
  id: "12345",
  title: "Kontrak Vendor 2025",
  expireDate: "2025-12-31",  // ← WAJIB ADA!
  documentExpired: false,
  reminderActive: true,       // Opsional, bisa di-derive
  reminderType: "warning",    // Opsional, bisa di-derive
  // ... field lainnya
}
```

**Logic Reminder:**

```
IF expireDate exists:
  IF expireDate < today → EXPIRED (red card)
  ELSE IF expireDate <= today + 30 days → EXPIRING SOON (yellow card)
  ELSE → No reminder
ELSE:
  No reminder (tidak ada expireDate)
```

---

## 🎯 Kesimpulan

**Dari screenshot kamu:**

- ✅ API berhasil fetch 1000 documents
- ❌ Reminders kosong = **TIDAK ADA dokumen dengan expire date**

**Ini BUKAN bug aplikasi!** Ini kondisi data dari Demplon.

**Next Steps:**

1. **Cek console log** untuk konfirmasi
2. **Koordinasi dengan tim Demplon** untuk isi expire date di database
3. **Atau** implement reminder alternatif (berdasarkan update date, status, dll)

**Untuk testing UI:**

- Bisa inject mock data temporary (lihat Solusi #3)
- Atau manual edit beberapa dokumen di Demplon admin panel

---

## 💡 Quick Fix untuk Testing

Tambahkan ini di `usePersistentDocuments.ts` setelah line `console.log("📦 API Response received:")`:

```typescript
// 🧪 TEMPORARY: Inject mock expire dates untuk testing UI
if (process.env.NODE_ENV === "development") {
  const docsWithExpire = apiDocuments.filter((d) => d.expireDate);
  if (docsWithExpire.length === 0) {
    console.log("🧪 TEST MODE: Injecting mock expire dates...");
    const today = new Date();

    // 2 dokumen expired
    apiDocuments[0].expireDate = new Date(
      today.getTime() - 10 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    apiDocuments[0].documentExpired = true;
    apiDocuments[1].expireDate = new Date(
      today.getTime() - 5 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    apiDocuments[1].documentExpired = true;

    // 3 dokumen akan expire
    apiDocuments[2].expireDate = new Date(
      today.getTime() + 5 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    apiDocuments[3].expireDate = new Date(
      today.getTime() + 15 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];
    apiDocuments[4].expireDate = new Date(
      today.getTime() + 25 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    console.log("🧪 Injected 2 expired + 3 expiring soon documents");
  }
}
```

**Hapus setelah testing selesai!**
