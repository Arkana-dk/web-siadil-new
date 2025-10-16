# Quick Reference: API Dokumen Terbaru

## 🚀 Quick Start

### 1. Import Hook

```typescript
import { useLatestDocuments } from "@/app/dashboard/siadil/hooks/useLatestDocuments";
```

### 2. Gunakan di Component

```typescript
function MyComponent() {
  const [docs, refetch, { isLoading, error }] = useLatestDocuments({
    length: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {docs.map((doc) => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

## 📌 Endpoint

**Demplon API:**

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?start=0&length=10&sort[]=id&sortdir[]=DESC
```

**Internal Proxy:**

```
GET /api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC
```

## 🔧 Parameters

| Param     | Default  | Deskripsi            |
| --------- | -------- | -------------------- |
| start     | 0        | Offset pagination    |
| length    | 10       | Jumlah dokumen       |
| sort[]    | ["id"]   | Field untuk sort     |
| sortdir[] | ["DESC"] | Arah sort (ASC/DESC) |

## 💡 Use Cases

### 1. Dashboard Widget (5 dokumen terbaru)

```typescript
const [docs] = useLatestDocuments({ length: 5 });
```

### 2. Pagination

```typescript
const [docs] = useLatestDocuments({
  start: page * 10,
  length: 10,
});
```

### 3. Manual Refresh

```typescript
const [docs, refetch] = useLatestDocuments({ length: 10 });

<button onClick={refetch}>Refresh</button>;
```

### 4. Custom Sorting

```typescript
const docs = await getLatestDocumentsFromAPI(undefined, {
  start: 0,
  length: 20,
  sort: ["document_date"],
  sortdir: ["ASC"],
});
```

## 📁 File Locations

- **Hook:** `src/app/dashboard/siadil/hooks/useLatestDocuments.ts`
- **Data Function:** `src/app/dashboard/siadil/data.ts` → `getLatestDocumentsFromAPI()`
- **API Route:** `src/app/api/demplon/documents/latest/route.ts`
- **Dokumentasi Lengkap:** `LATEST_DOCUMENTS_API_GUIDE.md`
- **Contoh Lengkap:** `EXAMPLE_LATEST_DOCUMENTS_USAGE.tsx`

## ⚠️ Common Issues

### 401 Unauthorized

→ User belum login, redirect ke login page

### 403 Forbidden

→ User tidak punya permission di Demplon  
→ Hubungi admin Demplon untuk setup permission

### Empty Data

→ Cek `recordsTotal` di response  
→ Pastikan ada data di database

## 📚 Related Docs

- [LATEST_DOCUMENTS_API_GUIDE.md](./LATEST_DOCUMENTS_API_GUIDE.md) - Dokumentasi lengkap
- [EXAMPLE_LATEST_DOCUMENTS_USAGE.tsx](./EXAMPLE_LATEST_DOCUMENTS_USAGE.tsx) - 6 contoh implementasi
- [API_INTEGRATION.md](./API_INTEGRATION.md) - Integrasi API Demplon
