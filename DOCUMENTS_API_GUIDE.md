# 📄 Demplon Documents API Integration

## Overview

API endpoint untuk mengambil **documents** dari Demplon dengan filter reminder aktif.

**Status**: ✅ **READY TO USE**

---

## 🔌 Endpoint Information

### External API (Demplon)

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/
```

### Internal API Route (Next.js Proxy)

```
GET /api/demplon/documents
```

**Query Parameters:**

- `length` (optional): Number - Limit hasil (default: 6)
- `reminder_active` (optional): Boolean - Filter dokumen dengan reminder aktif (default: true)

---

## 🔐 Security Features

✅ **Server-side proxy** - No CORS issues  
✅ **Auto authentication** - Uses NextAuth session  
✅ **Bearer token** - Automatic from SSO login  
✅ **403 handling** - Detailed error messages  
✅ **Mock data fallback** - For development (optional)

---

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1234,
      "number": "DOC-2024-001",
      "title": "Laporan Keuangan Q4 2024",
      "description": "Laporan keuangan kuartal 4 tahun 2024",
      "document_date": "2024-12-31",
      "expire_date": "2025-03-31",
      "id_archive": 17,
      "archive": {
        "id": 17,
        "code": "TIK",
        "name": "Teknologi, Informasi & Komunikasi"
      },
      "date_created": "2024-12-01T10:00:00.000Z",
      "last_updated": "2024-12-15T14:30:00.000Z",
      "reminder_active": true
    },
    {
      "id": 1235,
      "number": "DOC-2024-002",
      "title": "Kontrak Vendor Software",
      "description": "Perpanjangan kontrak software 2025",
      "document_date": "2024-11-15",
      "expire_date": "2025-02-15",
      "id_archive": 41,
      "archive": {
        "id": 41,
        "code": "licenses-renewals",
        "name": "Licenses & Renewals"
      },
      "date_created": "2024-11-15T08:00:00.000Z",
      "last_updated": "2024-11-20T16:45:00.000Z",
      "reminder_active": true
    }
  ],
  "count": 2,
  "queryParams": {
    "length": 6,
    "reminder_active": true
  },
  "timestamp": "2025-10-10T10:30:00.000Z"
}
```

### Error Response (403 Forbidden)

```json
{
  "success": false,
  "error": "Demplon API returned 403",
  "status": 403,
  "statusText": "Forbidden",
  "details": {
    "message": "Forbidden resource",
    "error": "Forbidden",
    "statusCode": 403
  },
  "actionRequired": {
    "step1": "Contact Demplon admin",
    "step2": "Register user: 12231149 (ID: 666)",
    "step3": "Grant permission: 'documents.read'",
    "step4": "Or setup SSO-Demplon integration"
  }
}
```

---

## 💻 Usage Examples

### 1. Using Helper Function (Recommended)

```typescript
import { fetchDocuments } from "@/lib/api";

// Default: 6 documents with reminder_active=true
const documents = await fetchDocuments();

// Custom parameters
const moreDocuments = await fetchDocuments({
  length: 10,
  reminder_active: false,
});

console.log(documents); // Direct array of DemplonDocumentItem[]
```

### 2. Direct API Call

```typescript
const response = await fetch(
  "/api/demplon/documents?length=6&reminder_active=true",
  {
    method: "GET",
    credentials: "include",
  }
);

const result = await response.json();
if (result.success) {
  console.log(result.data); // Array of documents
}
```

### 3. In React Component

```typescript
"use client";

import { useEffect, useState } from "react";
import { fetchDocuments } from "@/lib/api";
import type { DemplonDocumentItem } from "@/app/dashboard/siadil/types";

export function DocumentsList() {
  const [documents, setDocuments] = useState<DemplonDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await fetchDocuments({
          length: 10,
          reminder_active: true,
        });
        setDocuments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load documents"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Documents with Active Reminders ({documents.length})</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <strong>{doc.number}</strong>: {doc.title}
            <br />
            <small>Expires: {doc.expire_date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

No additional env vars needed! Uses same session/token from archives API.

### Mock Data Fallback (Development Only)

To enable mock data when getting 403 errors:

```env
# .env.local
USE_MOCK_ON_403=true
NODE_ENV=development
```

**Mock data will return 2 sample documents for UI testing.**

---

## 🐛 Troubleshooting

### Issue: 403 Forbidden Error

**Cause**: User tidak punya permission untuk akses documents di Demplon

**Solution**:

1. Check server logs untuk user details
2. Contact Demplon admin dengan informasi:
   - User ID: `[dari session]`
   - Username: `[dari session]`
   - Required permission: `documents.read`
3. Request permission setup atau SSO integration

### Issue: No Documents Returned

**Cause**: Tidak ada documents dengan `reminder_active=true`

**Solution**:

```typescript
// Try tanpa filter
const allDocuments = await fetchDocuments({
  length: 20,
  reminder_active: false,
});
```

### Issue: CORS Error

**Cause**: Calling Demplon API directly dari browser

**Solution**:
✅ **ALWAYS use internal API route** `/api/demplon/documents`  
❌ **NEVER call** `https://demplon.pupuk-kujang.co.id/...` directly from client

---

## 📝 TypeScript Types

```typescript
// Response dari API route
interface DocumentsAPIResponse {
  success: boolean;
  data: DemplonDocumentItem[];
  count: number;
  queryParams: {
    length: number;
    reminder_active: boolean;
  };
  timestamp: string;
  isMock?: boolean;
  warning?: string;
}

// Single document item
interface DemplonDocumentItem {
  id: number;
  number: string;
  title: string;
  description: string | null;
  document_date: string; // YYYY-MM-DD
  expire_date: string | null; // YYYY-MM-DD
  id_archive: number;
  archive: {
    id: number;
    code: string;
    name: string;
  };
  date_created: string; // ISO 8601
  last_updated: string; // ISO 8601
  reminder_active: boolean;
  id_user?: string;
  file_url?: string;
  file_type?: string;
}
```

---

## 🔍 Example Use Cases

### 1. Dashboard Reminders Widget

```typescript
// Show documents expiring soon
const expiringDocs = await fetchDocuments({
  length: 5,
  reminder_active: true,
});
```

### 2. Documents List with All Types

```typescript
// Show all documents (tidak hanya yang reminder aktif)
const allDocs = await fetchDocuments({
  length: 50,
  reminder_active: false,
});
```

### 3. Archive-Specific Documents

```typescript
const docs = await fetchDocuments({ length: 20 });
const tikDocs = docs.filter((doc) => doc.archive.code === "TIK");
```

---

## ✅ Checklist

- [x] API route created at `/api/demplon/documents/route.ts`
- [x] Helper function `fetchDocuments()` in `/lib/api.ts`
- [x] TypeScript types in `/types.ts`
- [x] Server-side authentication
- [x] CORS bypass via proxy
- [x] Error handling (403, 401, 500)
- [x] Mock data fallback
- [x] Query parameters support
- [x] Comprehensive logging

---

## 📚 Related Documentation

- [Archives API Guide](./API_INTEGRATION.md)
- [403 Forbidden Solution](./SOLUTION_403_FORBIDDEN.md)
- [Authentication Guide](./AUTH_README.md)

---

## 🚀 Next Steps

1. **Test API**: Use Debug Panel or create test component
2. **Setup Permissions**: Contact Demplon admin if getting 403
3. **Integrate UI**: Use `fetchDocuments()` in your components
4. **Monitor Logs**: Check server console for API calls

---

**Last Updated**: October 10, 2025  
**Status**: Production Ready ✅
