# 📡 API Services Documentation

## Overview

All API calls in this application are centralized in `src/services/api/` for better maintainability, type safety, and testability.

---

## 🗂️ Structure

```
src/services/api/
├── index.ts              # Main exports & common utilities
├── auth.service.ts       # Authentication API calls
└── demplon.service.ts    # Demplon API calls (Archives, Documents, Reminders)
```

---

## 🚀 Quick Start

### Import Services

```typescript
// Import all services
import * as API from "@/services/api";

// Or import specific services
import { fetchArchives, fetchDocuments, login } from "@/services/api";
```

### Basic Usage

```typescript
"use client";

import { useSession } from "next-auth/react";
import { fetchDocuments } from "@/services/api";

export default function MyComponent() {
  const { data: session } = useSession();

  useEffect(() => {
    const loadData = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetchDocuments(session.accessToken, {
          start: 0,
          length: 10,
        });

        console.log("Documents:", response.data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    loadData();
  }, [session]);
}
```

---

## 📚 Available Services

### 1. Authentication Service (`auth.service.ts`)

#### `login(credentials)`

Login to the system

```typescript
import { login } from "@/services/api";

const response = await login({
  username: "user123",
  password: "password123",
});

console.log("Access token:", response.access_token);
console.log("User:", response.user);
```

**Parameters:**

- `credentials.username` (string) - User username
- `credentials.password` (string) - User password

**Returns:** `LoginResponse`

```typescript
{
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    pic?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
}
```

---

### 2. Demplon Service (`demplon.service.ts`)

#### Archives API

##### `fetchArchives(accessToken)`

Fetch all archives

```typescript
import { fetchArchives } from "@/services/api";

const response = await fetchArchives(session.accessToken);
console.log("Total archives:", response.recordsTotal);
console.log("Archives:", response.data);
```

**Returns:** `PaginatedResponse<Archive>`

---

##### `fetchArchiveTree(accessToken, parentId?)`

Fetch archive tree structure

```typescript
import { fetchArchiveTree } from "@/services/api";

// Get root archives
const rootArchives = await fetchArchiveTree(session.accessToken);

// Get child archives
const childArchives = await fetchArchiveTree(session.accessToken, "parent-id");
```

**Returns:** `Archive[]`

---

##### `createArchive(accessToken, archiveData)`

Create new archive

```typescript
import { createArchive } from "@/services/api";

const newArchive = await createArchive(session.accessToken, {
  name: "New Archive",
  code: "NEW-001",
  parentId: "root",
});
```

---

##### `updateArchive(accessToken, archiveId, archiveData)`

Update existing archive

```typescript
import { updateArchive } from "@/services/api";

const updated = await updateArchive(session.accessToken, "archive-id", {
  name: "Updated Name",
});
```

---

##### `deleteArchive(accessToken, archiveId)`

Delete archive

```typescript
import { deleteArchive } from "@/services/api";

await deleteArchive(session.accessToken, "archive-id");
```

---

#### Documents API

##### `fetchDocuments(accessToken, params?)`

Fetch documents with pagination

```typescript
import { fetchDocuments } from "@/services/api";

const response = await fetchDocuments(session.accessToken, {
  start: 0, // Offset
  length: 10, // Limit
  search: "query", // Search term
});

console.log("Total documents:", response.recordsTotal);
console.log("Filtered:", response.recordsFiltered);
console.log("Documents:", response.data);
```

**Parameters:**

- `params.start` (number, optional) - Pagination offset
- `params.length` (number, optional) - Number of records
- `params.search` (string, optional) - Search query

**Returns:** `PaginatedResponse<Document>`

---

##### `fetchDocumentsByArchive(accessToken, archiveCode, params?)`

Fetch documents filtered by archive

```typescript
import { fetchDocumentsByArchive } from "@/services/api";

const response = await fetchDocumentsByArchive(
  session.accessToken,
  "ARCHIVE-CODE",
  { start: 0, length: 10 }
);
```

---

##### `fetchDocumentById(accessToken, documentId)`

Fetch single document

```typescript
import { fetchDocumentById } from "@/services/api";

const document = await fetchDocumentById(session.accessToken, "document-id");
```

---

##### `createDocument(accessToken, documentData)`

Create new document

```typescript
import { createDocument } from "@/services/api";

const newDoc = await createDocument(session.accessToken, {
  title: "New Document",
  description: "Document description",
  archive: "ARCHIVE-CODE",
  documentDate: "2024-10-16",
});
```

---

##### `updateDocument(accessToken, documentId, documentData)`

Update existing document

```typescript
import { updateDocument } from "@/services/api";

const updated = await updateDocument(session.accessToken, "document-id", {
  title: "Updated Title",
});
```

---

##### `deleteDocument(accessToken, documentId)`

Delete document

```typescript
import { deleteDocument } from "@/services/api";

await deleteDocument(session.accessToken, "document-id");
```

---

#### Reminders API

##### `fetchReminders(accessToken, params?)`

Fetch reminders with pagination

```typescript
import { fetchReminders } from "@/services/api";

const response = await fetchReminders(session.accessToken, {
  start: 0,
  length: 10,
});

console.log("Reminders:", response.data);
```

---

##### `fetchRemindersByType(accessToken, type)`

Fetch reminders filtered by type

```typescript
import { fetchRemindersByType } from "@/services/api";

// Get error reminders
const errors = await fetchRemindersByType(session.accessToken, "error");

// Get warning reminders
const warnings = await fetchRemindersByType(session.accessToken, "warning");

// Get all reminders
const all = await fetchRemindersByType(session.accessToken, "all");
```

---

## 🔧 Utility Functions

### `buildApiUrl(endpoint, params?)`

Build API URL with query parameters

```typescript
import { buildApiUrl } from "@/services/api";

const url = buildApiUrl("/documents", {
  start: 0,
  length: 10,
  search: "test",
});

console.log(url); // /documents?start=0&length=10&search=test
```

---

### `isApiSuccess(response)`

Check if API response is successful

```typescript
import { isApiSuccess } from "@/services/api";

const response = await fetchDocuments(accessToken);

if (isApiSuccess(response)) {
  console.log("Success!", response.data);
} else {
  console.log("Failed");
}
```

---

## ⚠️ Error Handling

All API calls can throw `APIError`:

```typescript
import { fetchDocuments, APIError } from "@/services/api";

try {
  const response = await fetchDocuments(accessToken);
} catch (error) {
  if (error instanceof APIError) {
    console.error("API Error:", error.message);
    console.error("Status Code:", error.statusCode);
    console.error("Response:", error.response);
  } else {
    console.error("Unknown error:", error);
  }
}
```

---

## 🎯 Best Practices

### 1. Always Use Try-Catch

```typescript
try {
  const data = await fetchDocuments(accessToken);
  // Handle success
} catch (error) {
  // Handle error
  console.error(error);
}
```

### 2. Check Session First

```typescript
if (!session?.accessToken) {
  console.log("Not authenticated");
  return;
}

const data = await fetchDocuments(session.accessToken);
```

### 3. Use Loading States

```typescript
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await fetchDocuments(accessToken);
    setDocuments(data.data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

### 4. Handle Pagination

```typescript
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

const loadPage = async () => {
  const response = await fetchDocuments(accessToken, {
    start: page * pageSize,
    length: pageSize,
  });

  console.log(
    `Page ${page + 1} of ${Math.ceil(response.recordsTotal / pageSize)}`
  );
};
```

---

## 🔄 Migration Guide

### From Old API (`src/lib/api.ts`)

**Before:**

```typescript
const response = await fetch("/api/demplon/documents", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
const data = await response.json();
```

**After:**

```typescript
import { fetchDocuments } from "@/services/api";

const data = await fetchDocuments(accessToken);
```

**Benefits:**

- ✅ Type-safe
- ✅ Error handling built-in
- ✅ Consistent API
- ✅ Less boilerplate
- ✅ Easier to test

---

## 📝 Type Definitions

All types are exported from the service:

```typescript
import type {
  Archive,
  Document,
  Reminder,
  PaginatedResponse,
  PaginationParams,
} from "@/services/api";
```

---

## 🧪 Testing

```typescript
import { fetchDocuments } from "@/services/api";

// Mock for testing
jest.mock("@/services/api", () => ({
  fetchDocuments: jest.fn(() =>
    Promise.resolve({
      data: [],
      recordsTotal: 0,
      recordsFiltered: 0,
    })
  ),
}));
```

---

## 📞 Support

For questions or issues with API services:

1. Check this documentation
2. Review TypeScript types
3. Check browser console for errors
4. Contact dev team

---

**Last Updated:** October 16, 2024
**Version:** 1.0.0
