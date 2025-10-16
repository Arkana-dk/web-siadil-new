# Documents API - Cara Penggunaan

## 📋 Overview

Documents API digunakan untuk mengambil daftar dokumen dari Demplon dengan fitur filtering berdasarkan reminder.

**Endpoint**: `GET /api/demplon/documents`

**Response Structure**:

```json
{
  "data": [
    {
      "id": 75658,
      "unique": "inWxv3vSWhUT6MuuLXKgW",
      "number": "DTS 3.1",
      "id_archive": 146,
      "title": "DTS 3.1",
      "description": "DTS 3.1",
      "document_date": "2024-09-10T00:00:00.000Z",
      "document_expire_date": null,
      "notification": false,
      "reminder": false,
      "id_section": null,
      "date_created": "2024-09-11T01:36:10.000Z",
      "last_updated": "2024-09-11T01:36:10.000Z",
      "id_user": "3082625",
      "archive": {
        "id": 146,
        "slug": "yp4w-dokumentasiaplikasi-dokumentasi-aplikasi",
        "code": "DOKUMENTASIAPLIKASI",
        "name": "Dokumentasi Aplikasi",
        "description": "Dokumentasi Aplikasi",
        "id_section": null,
        "id_parent": 17,
        "date_created": "2024-03-18T05:18:36.000Z",
        "last_updated": "2024-03-18T05:18:36.000Z",
        "id_user": "666",
        "filecategories": []
      },
      "files": [],
      "contributors": [],
      "notifications_reminders": [],
      "document_expired": false,
      "reminder_active": false,
      "reminder_info": false,
      "reminder_type": "info",
      "reminder_object": false,
      "reminder_link": false,
      "completion": false
    }
  ],
  "length": 10,
  "total": 13
}
```

## 🔑 Key Fields

### Response Wrapper

- `data` - Array of documents
- `length` - Jumlah yang diminta (dari query param)
- `total` - Total dokumen tersedia di database

### Document Item

- `id` - Document ID
- `unique` - Unique identifier string
- `number` - Nomor dokumen (contoh: "DTS 3.1")
- `title` - Judul dokumen
- `description` - Deskripsi dokumen
- `document_date` - Tanggal dokumen (ISO 8601)
- `document_expire_date` - Tanggal expire (ISO 8601, nullable)
- `archive` - Nested object dengan detail archive
  - `id` - Archive ID
  - `code` - Kode archive (contoh: "DOKUMENTASIAPLIKASI")
  - `name` - Nama archive
- `files` - Array of files terlampir
- `reminder_active` - Status reminder (boolean)

## 🎯 Query Parameters

| Parameter         | Type    | Default | Description                          |
| ----------------- | ------- | ------- | ------------------------------------ |
| `length`          | number  | 6       | Jumlah dokumen yang diminta          |
| `reminder_active` | boolean | true    | Filter dokumen dengan reminder aktif |

## 📝 Cara Penggunaan

### 1. Menggunakan Helper Function (Recommended)

```typescript
import { fetchDocuments } from "@/lib/api";

// Default: 6 documents dengan reminder aktif
const documents = await fetchDocuments();

// Custom parameters
const documents = await fetchDocuments({
  length: 10,
  reminder_active: false,
});
```

### 2. Direct API Call

```typescript
const response = await fetch(
  "/api/demplon/documents?length=10&reminder_active=true",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    cache: "no-store",
  }
);

const result = await response.json();

if (result.success) {
  const documents = result.data; // Array of documents
  const total = result.total; // Total available
  console.log(`Showing ${documents.length} of ${total} documents`);
}
```

### 3. Menggunakan React (Client Component)

```typescript
"use client";

import { useState, useEffect } from "react";
import { fetchDocuments } from "@/lib/api";

export function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await fetchDocuments({ length: 10 });
        setDocuments(data);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Documents ({documents.length})</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <strong>{doc.number}</strong>: {doc.title}
            <br />
            <small>Archive: {doc.archive.name}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Menggunakan Server Component

```typescript
import { fetchDocuments } from "@/lib/api";

export default async function DocumentsPage() {
  const documents = await fetchDocuments({ length: 20 });

  return (
    <div>
      <h1>Documents ({documents.length})</h1>
      {documents.map((doc) => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <p>{doc.description}</p>
          <small>
            Archive: {doc.archive.name} | Date:{" "}
            {new Date(doc.document_date).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  );
}
```

## 🧪 Testing via Debug Panel

1. **Buka Dashboard**: Pergi ke `/dashboard/siadil`
2. **Lihat Debug Panel**: Di pojok kanan bawah (jika sudah login)
3. **Klik "📄 TEST Documents API"**: Akan memanggil endpoint documents
4. **Lihat Results**: Panel akan menampilkan response dan data

### Test via Browser Console

```javascript
// Test documents API
fetch("/api/demplon/documents?length=5&reminder_active=true")
  .then((res) => res.json())
  .then((data) => console.log("Documents:", data))
  .catch((err) => console.error("Error:", err));
```

## 🔍 Filtering Documents

### By Reminder Status

```typescript
// Hanya dokumen dengan reminder aktif
const activeReminders = await fetchDocuments({
  reminder_active: true,
});

// Semua dokumen (tanpa filter reminder)
const allDocs = await fetchDocuments({
  reminder_active: false,
});
```

### By Limit

```typescript
// Ambil 20 dokumen
const moreDocs = await fetchDocuments({ length: 20 });

// Ambil 5 dokumen saja
const fewDocs = await fetchDocuments({ length: 5 });
```

## 📊 Response Handling

### Success Response

```typescript
{
  "success": true,
  "data": [...],      // Array of documents
  "count": 10,        // Actual count returned
  "length": 10,       // Requested length
  "total": 13,        // Total available
  "queryParams": {
    "length": 10,
    "reminder_active": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response (403 Forbidden)

```typescript
{
  "success": false,
  "error": "Demplon API returned 403",
  "status": 403,
  "statusText": "Forbidden",
  "actionRequired": {
    "step1": "Contact Demplon admin",
    "step2": "Register user: 666 (ID: 666)",
    "step3": "Grant permission: 'documents.read'",
    "step4": "Or setup SSO-Demplon integration"
  }
}
```

## ⚠️ Troubleshooting

### 403 Forbidden Error

**Penyebab**: User tidak punya permission untuk akses documents API

**Solusi**:

1. Hubungi admin Demplon
2. Minta setup permission untuk user Anda
3. User ID: (cek di session)
4. Permission required: `documents.read`

### Empty Response

```typescript
{
  "success": true,
  "data": [],
  "count": 0,
  "total": 0
}
```

**Kemungkinan**:

- Tidak ada dokumen dengan filter yang diminta
- User tidak punya akses ke dokumen apapun
- Database kosong

### Network Error

**Solusi**:

- Pastikan koneksi internet stabil
- Cek apakah perlu VPN untuk akses Demplon API
- Lihat console logs untuk detail error

## 🔐 Authentication

API ini menggunakan NextAuth session untuk authentication:

- Token diambil dari session cookies secara otomatis
- Tidak perlu manual pass token dari client
- Server-side proxy handle Authorization header

## 📁 Type Definitions

Lihat file `src/app/dashboard/siadil/types.ts` untuk:

- `DemplonDocumentResponse` - Response wrapper
- `DemplonDocumentItem` - Single document structure
- `DocumentArchive` - Archive detail
- `DocumentFile` - File attachment structure

## 🚀 Next Steps

1. ✅ Test API via Debug Panel
2. ✅ Resolve 403 permission (if needed)
3. ⚙️ Implement Documents UI component
4. 📄 Add pagination for large document lists
5. 🔍 Add more filtering options (date range, archive, etc)
