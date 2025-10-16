# Dokumentasi API Dokumen Terbaru Demplon

## 📋 Ringkasan

API ini digunakan untuk mengambil dokumen-dokumen terbaru dari sistem Demplon dengan fitur sorting dan pagination. Dokumen akan diurutkan berdasarkan ID secara descending (terbaru dulu).

## 🔗 Endpoint

### Endpoint Demplon (Original)

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?start=0&length=10&sort[]=id&sortdir[]=DESC
```

### Endpoint Internal (Proxy)

```
GET /api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC
```

## 📊 Query Parameters

| Parameter   | Tipe     | Default  | Deskripsi                                               |
| ----------- | -------- | -------- | ------------------------------------------------------- |
| `start`     | number   | 0        | Offset untuk pagination (mulai dari dokumen ke berapa)  |
| `length`    | number   | 10       | Jumlah dokumen yang akan diambil                        |
| `sort[]`    | string[] | ["id"]   | Field yang akan digunakan untuk sorting (bisa multiple) |
| `sortdir[]` | string[] | ["DESC"] | Arah sorting: ASC (naik) atau DESC (turun)              |

## 📥 Response Structure

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 75658,
      "number": "DOC-2024-001",
      "title": "Laporan Keuangan Q4 2024",
      "description": "Laporan keuangan kuartal 4 tahun 2024",
      "document_date": "2024-12-31T00:00:00.000Z",
      "document_expire_date": "2025-03-31T00:00:00.000Z",
      "id_archive": 146,
      "archive": {
        "id": 146,
        "code": "DOKUMENTASIAPLIKASI",
        "name": "Dokumentasi Aplikasi"
      },
      "files": [...],
      "contributors": [...],
      "reminder_active": true,
      "reminder_type": "info",
      "document_expired": false
    }
  ],
  "recordsTotal": 150,
  "recordsFiltered": 150,
  "draw": 1,
  "queryParams": {
    "start": 0,
    "length": 10,
    "sort": ["id"],
    "sortdir": ["DESC"]
  },
  "timestamp": "2025-10-11T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Demplon API returned 403",
  "status": 403,
  "statusText": "Forbidden",
  "details": {...},
  "actionRequired": {
    "step1": "Hubungi admin Demplon",
    "step2": "Daftarkan user: username (ID: 666)",
    "step3": "Berikan permission: 'documents.read'",
    "step4": "Atau setup integrasi SSO-Demplon"
  }
}
```

## 🔑 Authentication

API ini memerlukan authentication melalui NextAuth session. Token akses akan otomatis diambil dari session dan dikirim dalam header `Authorization: Bearer <token>`.

### Prasyarat

- User harus sudah login
- Session harus valid
- User memiliki permission untuk mengakses dokumen di Demplon

## 💻 Cara Penggunaan

### 1. Menggunakan Hook `useLatestDocuments`

Hook ini adalah cara termudah untuk mengambil dokumen terbaru di component React.

```typescript
import { useLatestDocuments } from "@/app/dashboard/siadil/hooks/useLatestDocuments";

function MyComponent() {
  // Auto fetch 10 dokumen terbaru saat component mount
  const [latestDocs, refetch, { isLoading, error }] = useLatestDocuments({
    length: 10,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Dokumen Terbaru</h2>
      <button onClick={refetch}>Refresh</button>
      {latestDocs.map((doc) => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

### 2. Menggunakan Function `getLatestDocumentsFromAPI`

Untuk penggunaan yang lebih flexible di luar React component.

```typescript
import { getLatestDocumentsFromAPI } from "@/app/dashboard/siadil/data";

// Ambil 10 dokumen terbaru
const latestDocs = await getLatestDocumentsFromAPI(undefined, {
  start: 0,
  length: 10,
  sort: ["id"],
  sortdir: ["DESC"],
});

// Ambil 20 dokumen berikutnya (pagination)
const nextBatch = await getLatestDocumentsFromAPI(undefined, {
  start: 10,
  length: 20,
  sort: ["id"],
  sortdir: ["DESC"],
});

// Sort berdasarkan tanggal dokumen (ascending)
const sortedByDate = await getLatestDocumentsFromAPI(undefined, {
  start: 0,
  length: 10,
  sort: ["document_date"],
  sortdir: ["ASC"],
});
```

### 3. Menggunakan API Route Directly

Untuk custom use case atau dari external service.

```typescript
// Fetch dokumen terbaru
const response = await fetch(
  "/api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC",
  {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  }
);

const result = await response.json();

if (result.success) {
  console.log("Total dokumen:", result.recordsTotal);
  console.log("Dokumen:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## 📝 Contoh Use Cases

### 1. Tampilkan 5 Dokumen Terbaru di Dashboard

```typescript
function DashboardLatestDocs() {
  const [docs, refetch, { isLoading }] = useLatestDocuments({ length: 5 });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-bold mb-3">Dokumen Terbaru</h3>
      {isLoading ? (
        <p>Memuat...</p>
      ) : (
        <ul>
          {docs.map((doc) => (
            <li key={doc.id} className="py-2 border-b">
              <p className="font-medium">{doc.title}</p>
              <p className="text-sm text-gray-500">{doc.archiveName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 2. Pagination dengan Load More

```typescript
function DocumentsWithPagination() {
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadMore = async () => {
    const moreDocs = await getLatestDocumentsFromAPI(undefined, {
      start: page * pageSize,
      length: pageSize,
    });
    setAllDocs([...allDocs, ...moreDocs]);
    setPage(page + 1);
  };

  return (
    <div>
      {allDocs.map((doc) => (
        <div key={doc.id}>{doc.title}</div>
      ))}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}
```

### 3. Sort Custom dengan Multiple Fields

```typescript
// Sort berdasarkan tanggal expire (descending), lalu ID (descending)
const docs = await getLatestDocumentsFromAPI(undefined, {
  start: 0,
  length: 20,
  sort: ["document_expire_date", "id"],
  sortdir: ["DESC", "DESC"],
});
```

## 🔍 Debugging

### Cek Console Logs

API route akan log informasi detail di console:

```
📡 Fetching latest documents from Demplon API...
👤 User: username (Display Name)
🆔 User ID: 666
📧 User Email: user@example.com
🔑 Token available: true
📊 Query params: { start: 0, length: 10, sort: ["id"], sortdir: ["DESC"] }
🔌 Calling: https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?start=0&length=10&sort[]=id&sortdir[]=DESC
📦 Response status: 200 OK
✅ Successfully fetched 10 latest documents
   - Total records: 150
   - Filtered records: 150
```

### Common Issues

#### 1. 401 Unauthorized

**Penyebab:** User belum login atau session expired  
**Solusi:** Redirect ke halaman login

#### 2. 403 Forbidden

**Penyebab:** User tidak memiliki permission di Demplon  
**Solusi:** Hubungi admin Demplon untuk setup permission

#### 3. Empty Data

**Penyebab:** Belum ada dokumen di database atau filter terlalu ketat  
**Solusi:** Cek total records di response, pastikan ada data

## 🚀 Best Practices

1. **Gunakan Hook untuk React Components**

   - Hook `useLatestDocuments` sudah handle loading, error, dan refetch
   - Auto cleanup saat component unmount

2. **Implementasi Pagination**

   - Gunakan `start` dan `length` untuk pagination
   - Track total records dari response untuk UI pagination

3. **Error Handling**

   - Selalu handle error state di UI
   - Tampilkan pesan error yang user-friendly

4. **Caching Strategy**

   - API menggunakan `cache: 'no-store'` untuk data realtime
   - Pertimbangkan client-side caching jika diperlukan

5. **Performance**
   - Jangan fetch terlalu banyak dokumen sekaligus
   - Gunakan pagination untuk large datasets
   - Set `length` sesuai kebutuhan UI (5-20 optimal)

## 📚 Related Documentation

- [API_INTEGRATION.md](./API_INTEGRATION.md) - Integrasi API Demplon secara umum
- [DOCUMENTS_API_GUIDE.md](./DOCUMENTS_API_GUIDE.md) - Guide lengkap Documents API
- [AUTH_README.md](./AUTH_README.md) - Authentication dan Session management

## 🔄 Changelog

### Version 1.0.0 (2025-10-11)

- ✅ Initial implementation API endpoint `/api/demplon/documents/latest`
- ✅ Hook `useLatestDocuments` untuk React components
- ✅ Function `getLatestDocumentsFromAPI` untuk data fetching
- ✅ Support sorting dan pagination
- ✅ Dokumentasi lengkap dalam bahasa Indonesia
