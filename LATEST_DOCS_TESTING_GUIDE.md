# 🧪 Testing Guide: API Dokumen Terbaru

## 📋 Daftar Isi

1. [Manual Testing](#manual-testing)
2. [Browser Console Testing](#browser-console-testing)
3. [Component Testing](#component-testing)
4. [API Route Testing](#api-route-testing)
5. [Error Scenarios Testing](#error-scenarios-testing)
6. [Performance Testing](#performance-testing)

---

## 1. Manual Testing

### Test 1: Hook di Component

**File:** Buat file test `test-latest-docs.tsx`

```typescript
"use client";

import { useLatestDocuments } from "@/app/dashboard/siadil/hooks/useLatestDocuments";

export default function TestLatestDocs() {
  const [docs, refetch, { isLoading, error }] = useLatestDocuments({
    length: 5,
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Latest Documents</h1>

      <div>
        <p>Loading: {isLoading ? "YES" : "NO"}</p>
        <p>Error: {error ? error.message : "NONE"}</p>
        <p>Count: {docs.length}</p>
      </div>

      <button
        onClick={refetch}
        style={{
          padding: "10px 20px",
          background: "#10b981",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Refresh Data
      </button>

      <div style={{ marginTop: "20px" }}>
        <h2>Documents:</h2>
        {docs.map((doc) => (
          <div
            key={doc.id}
            style={{
              padding: "10px",
              border: "1px solid #e5e7eb",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            <p>
              <strong>ID:</strong> {doc.id}
            </p>
            <p>
              <strong>Title:</strong> {doc.title}
            </p>
            <p>
              <strong>Archive:</strong> {doc.archiveName}
            </p>
            <p>
              <strong>Reminder:</strong> {doc.reminderActive ? "YES" : "NO"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Cara Test:**

1. Buat page `/test-latest` dengan component di atas
2. Buka browser ke `/test-latest`
3. ✅ Harus muncul loading state
4. ✅ Setelah loading, harus muncul list dokumen
5. ✅ Click "Refresh" harus reload data
6. ✅ Check console untuk logs

---

## 2. Browser Console Testing

### Test API Route Directly

Buka browser console (F12) dan jalankan:

```javascript
// Test 1: Basic fetch (10 dokumen terbaru)
fetch(
  "/api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC",
  {
    credentials: "include",
    cache: "no-store",
  }
)
  .then((r) => r.json())
  .then((data) => {
    console.log("✅ Success:", data.success);
    console.log("📊 Total records:", data.recordsTotal);
    console.log("📦 Fetched:", data.data.length, "documents");
    console.log("📄 First doc:", data.data[0]);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
  });
```

### Test Pagination

```javascript
// Page 1 (0-9)
fetch(
  "/api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC",
  {
    credentials: "include",
  }
)
  .then((r) => r.json())
  .then((data) =>
    console.log(
      "Page 1:",
      data.data.map((d) => d.id)
    )
  );

// Page 2 (10-19)
fetch(
  "/api/demplon/documents/latest?start=10&length=10&sort[]=id&sortdir[]=DESC",
  {
    credentials: "include",
  }
)
  .then((r) => r.json())
  .then((data) =>
    console.log(
      "Page 2:",
      data.data.map((d) => d.id)
    )
  );
```

### Test Different Sorting

```javascript
// Sort by document date (oldest first)
fetch(
  "/api/demplon/documents/latest?start=0&length=5&sort[]=document_date&sortdir[]=ASC",
  {
    credentials: "include",
  }
)
  .then((r) => r.json())
  .then((data) => {
    console.log("Sorted by date ASC:");
    data.data.forEach((doc) => {
      console.log(`- ${doc.title} (${doc.documentDate})`);
    });
  });
```

---

## 3. Component Testing

### Test Widget Component

```typescript
// File: test-widget.tsx
import { LatestDocumentsWidget } from "@/EXAMPLE_LATEST_DOCUMENTS_USAGE";

export default function TestWidget() {
  return (
    <div style={{ padding: "40px", background: "#f3f4f6", minHeight: "100vh" }}>
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <LatestDocumentsWidget />
      </div>
    </div>
  );
}
```

**Expected Results:**

- ✅ Show loading spinner initially
- ✅ Display 5 latest documents
- ✅ Refresh button works
- ✅ Error state shows properly if API fails

### Test Pagination Component

```typescript
// File: test-pagination.tsx
import { LatestDocumentsPaginated } from "@/EXAMPLE_LATEST_DOCUMENTS_USAGE";

export default function TestPagination() {
  return (
    <div style={{ padding: "40px" }}>
      <LatestDocumentsPaginated />
    </div>
  );
}
```

**Expected Results:**

- ✅ Initial page shows 10 documents
- ✅ Previous button disabled on page 1
- ✅ Next button loads next page
- ✅ Page number updates correctly

---

## 4. API Route Testing

### Test Authentication

**Test 1: No Session (Should return 401)**

```bash
# Logout user terlebih dahulu, kemudian:
curl -X GET 'http://localhost:3000/api/demplon/documents/latest?start=0&length=5&sort[]=id&sortdir[]=DESC'
```

**Expected Response:**

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Anda harus login terlebih dahulu"
}
```

**Test 2: Valid Session (Should return 200)**

```bash
# Login dulu, kemudian:
curl -X GET 'http://localhost:3000/api/demplon/documents/latest?start=0&length=5&sort[]=id&sortdir[]=DESC' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN'
```

**Expected Response:**

```json
{
  "success": true,
  "data": [...],
  "recordsTotal": 150,
  "recordsFiltered": 150,
  "timestamp": "..."
}
```

### Test Query Parameters

**Test 3: Different Page Sizes**

```javascript
// 5 documents
fetch("/api/demplon/documents/latest?length=5")
  .then((r) => r.json())
  .then((d) => console.log("5 docs:", d.data.length));

// 20 documents
fetch("/api/demplon/documents/latest?length=20")
  .then((r) => r.json())
  .then((d) => console.log("20 docs:", d.data.length));

// 50 documents
fetch("/api/demplon/documents/latest?length=50")
  .then((r) => r.json())
  .then((d) => console.log("50 docs:", d.data.length));
```

**Test 4: Multiple Sort Fields**

```javascript
fetch(
  "/api/demplon/documents/latest?sort[]=document_date&sort[]=id&sortdir[]=DESC&sortdir[]=DESC",
  {
    credentials: "include",
  }
)
  .then((r) => r.json())
  .then((d) => console.log("Multi-sort:", d.data));
```

---

## 5. Error Scenarios Testing

### Scenario 1: Network Error

```javascript
// Simulate network error (matikan WiFi sebentar)
fetch("/api/demplon/documents/latest?start=0&length=5", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => console.log("Success:", d))
  .catch((err) => console.error("Network Error:", err));
```

**Expected:**

- ❌ Catch error
- 🔄 Hook should set error state
- 📱 UI should show error message

### Scenario 2: Invalid Parameters

```javascript
// Test dengan parameter invalid
fetch("/api/demplon/documents/latest?start=-1&length=0", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => console.log("Response:", d));
```

### Scenario 3: Session Expired

```javascript
// Tunggu sampai session expire (atau logout manual)
// Kemudian coba fetch
fetch("/api/demplon/documents/latest", { credentials: "include" })
  .then((r) => r.json())
  .then((d) => {
    if (d.success === false && d.error === "Unauthorized") {
      console.log("✅ Session expired handled correctly");
      // Should redirect to login
    }
  });
```

---

## 6. Performance Testing

### Test 1: Response Time

```javascript
console.time("API Response Time");
fetch("/api/demplon/documents/latest?start=0&length=10", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => {
    console.timeEnd("API Response Time");
    console.log("Data received:", d.data.length, "documents");
  });
```

**Expected:**

- ⚡ < 1 second untuk 10 dokumen
- ⚡ < 2 seconds untuk 50 dokumen
- ⚡ < 5 seconds untuk 100 dokumen

### Test 2: Multiple Concurrent Requests

```javascript
const requests = [
  fetch("/api/demplon/documents/latest?start=0&length=10", {
    credentials: "include",
  }),
  fetch("/api/demplon/documents/latest?start=10&length=10", {
    credentials: "include",
  }),
  fetch("/api/demplon/documents/latest?start=20&length=10", {
    credentials: "include",
  }),
];

Promise.all(requests)
  .then((responses) => Promise.all(responses.map((r) => r.json())))
  .then((results) => {
    console.log("All requests completed:");
    results.forEach((r, i) => {
      console.log(`Request ${i + 1}: ${r.data.length} documents`);
    });
  });
```

### Test 3: Large Dataset

```javascript
console.time("Large Dataset");
fetch("/api/demplon/documents/latest?start=0&length=100", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => {
    console.timeEnd("Large Dataset");
    console.log("Total size:", JSON.stringify(d).length, "bytes");
    console.log("Documents:", d.data.length);
  });
```

---

## 🎯 Test Checklist

### Functional Tests

- [ ] Hook loads data on mount
- [ ] Refetch function works
- [ ] Loading state toggles correctly
- [ ] Error state shows when API fails
- [ ] Documents render in UI
- [ ] Pagination works (prev/next)
- [ ] Load more appends data correctly
- [ ] Sorting works as expected

### Authentication Tests

- [ ] 401 when not logged in
- [ ] 200 when logged in with valid session
- [ ] 403 when user lacks permission
- [ ] Session refresh works

### Performance Tests

- [ ] Response time < 2 seconds
- [ ] Multiple requests don't block
- [ ] Large datasets load efficiently
- [ ] No memory leaks on component unmount

### Edge Cases

- [ ] Empty result set handled
- [ ] Invalid parameters rejected
- [ ] Network errors caught
- [ ] Expired session redirects to login

---

## 🐛 Debugging Tips

### 1. Check Console Logs

API Route logs banyak info:

```
📡 Fetching latest documents from Demplon API...
👤 User: username (Name)
🆔 User ID: 666
📊 Query params: {...}
🔌 Calling: https://...
📦 Response status: 200 OK
✅ Successfully fetched X documents
```

### 2. Check Network Tab

1. Buka DevTools (F12)
2. Tab "Network"
3. Filter: "Fetch/XHR"
4. Cari request ke `/api/demplon/documents/latest`
5. Check:
   - Status code (200, 401, 403?)
   - Response payload
   - Request headers (Cookie included?)
   - Response time

### 3. Check React DevTools

1. Install React DevTools extension
2. Buka "Components" tab
3. Cari component yang pakai `useLatestDocuments`
4. Check hooks state:
   - documents: Document[]
   - isLoading: boolean
   - error: Error | null

### 4. Common Issues

**Issue: Hook tidak fetch data**

- ✅ Check: User sudah login?
- ✅ Check: Session valid?
- ✅ Check: autoFetch = true?

**Issue: Data tidak muncul di UI**

- ✅ Check: docs.length > 0?
- ✅ Check: Loading state false?
- ✅ Check: Map key unique?

**Issue: API return 403**

- ✅ Check: User punya permission di Demplon?
- ✅ Solution: Hubungi admin Demplon

---

## 📊 Test Report Template

```markdown
## Test Report: API Dokumen Terbaru

**Date:** 2025-10-11
**Tester:** [Your Name]
**Environment:** Development / Production

### Test Results

| Test Case       | Status  | Notes                          |
| --------------- | ------- | ------------------------------ |
| Hook loads data | ✅ PASS | Loaded 10 docs in 1.2s         |
| Refetch works   | ✅ PASS | Successfully refreshed         |
| Pagination      | ✅ PASS | Prev/Next work correctly       |
| Load more       | ✅ PASS | Appends data correctly         |
| Sorting         | ✅ PASS | DESC by ID works               |
| Auth 401        | ✅ PASS | Returns 401 when not logged in |
| Auth 200        | ✅ PASS | Returns 200 with valid session |
| Performance     | ✅ PASS | < 2s for 50 documents          |

### Issues Found

1. **None** - All tests passed

### Recommendations

1. Add caching for better performance
2. Implement error boundary for graceful error handling
3. Add loading skeleton for better UX

**Overall Status: ✅ READY FOR PRODUCTION**
```

---

## 🚀 Ready for Testing!

Gunakan guide ini untuk test semua aspek API dokumen terbaru. Pastikan semua test case ✅ PASS sebelum deploy ke production.

**Good luck testing! 🧪**
