# Test Documents API - Troubleshooting Guide

## ✅ Format API yang BENAR

Berdasarkan dokumentasi Demplon:

```
https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=6&reminder_active=true
```

**Parameter:**

- `length` - Jumlah dokumen yang diambil (contoh: 6, 100, 1000)
- `reminder_active` - Filter reminder (true/false)

**TIDAK PERLU:**

- ❌ `start` parameter
- ❌ `sort[]` parameter
- ❌ `sortdir[]` parameter

## 🔧 Perubahan yang Dilakukan

### 1. API Route (src/app/api/demplon/documents/route.ts)

```typescript
// SEBELUM (SALAH):
const documentsEndpoint = `.../?start=${start}&length=${length}&sort[]=id&sortdir[]=DESC&reminder_active=${reminderActive}`;

// SESUDAH (BENAR):
const documentsEndpoint = `.../?length=${length}&reminder_active=${reminderActive}`;
```

### 2. data.ts (getDocumentsFromAPI)

```typescript
// SEBELUM:
const url = `/api/demplon/documents?start=${start}&length=${length}&reminder_active=${reminderActive}`;

// SESUDAH:
const url = `/api/demplon/documents?length=${length}&reminder_active=${reminderActive}`;
```

### 3. usePersistentDocuments.ts

```typescript
// SEBELUM:
await getDocumentsFromAPI(accessToken, {
  start: 0,
  length: 5000,
  reminder_active: false,
});

// SESUDAH:
await getDocumentsFromAPI(accessToken, {
  length: 1000,
  reminder_active: false,
});
```

## 🧪 Cara Test

### 1. Clear Cache & Refresh

```bash
# Di browser console:
localStorage.clear();
sessionStorage.clear();
```

### 2. Hard Refresh

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 3. Check Console Log

Seharusnya muncul:

```
📡 Fetching documents from Demplon API...
📊 Query params: {length: "1000", reminder_active: "false"}
🔌 Calling: https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=1000&reminder_active=false
📦 Response status: 200 OK  ← HARUS 200!
✅ Got XXX documents from API
```

### 4. Verify UI

- ✅ Red card "Expired" ada angka
- ✅ Yellow card "Will Expire" ada angka
- ✅ Documents list terisi
- ✅ Reminders modal ada data

## 🐛 Troubleshooting

### Masih Error 400?

1. Cek token masih valid (login ulang)
2. Cek VPN aktif (kalau diperlukan)
3. Cek user permission di Demplon backend

### Documents Kosong?

1. Cek console log untuk API response
2. Verify `response.data` adalah array
3. Cek `response.total` untuk tau jumlah dokumen di database

### Reminders Tidak Muncul?

1. Verify documents sudah loaded (`documents.length > 0`)
2. Cek ada dokumen dengan `expireDate` field
3. Verify `dynamicReminders` di page.tsx computed dengan benar

## 📊 Expected Flow

```
1. User Login
   ↓
2. usePersistentDocuments runs
   ↓
3. Call getDocumentsFromAPI(token, {length: 1000, reminder_active: false})
   ↓
4. Internal fetch /api/demplon/documents?length=1000&reminder_active=false
   ↓
5. API route fetch Demplon dengan token
   ↓
6. Demplon filter based on user permission
   ↓
7. Return documents array
   ↓
8. Save to state + localStorage
   ↓
9. useMemo compute dynamicReminders
   ↓
10. UI update (cards, modal, etc)
```

## 🎯 Current Settings

**Default Values:**

- `length`: 1000 dokumen
- `reminder_active`: false (ambil semua)

**Adjustable:**
Kalau kamu punya lebih dari 1000 dokumen, ubah di:

1. `route.ts` line ~40: `const length = searchParams.get("length") || "2000";`
2. `data.ts` line ~171: `const length = options?.length || 2000;`
3. `usePersistentDocuments.ts` line ~61: `length: 2000,`
