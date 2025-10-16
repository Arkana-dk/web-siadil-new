# 🔄 Flow Diagram: API Dokumen Terbaru

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIADIL Dashboard (Client)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Component (page.tsx)                     │ │
│  │                                                              │ │
│  │  const [docs, refetch, { isLoading, error }] =              │ │
│  │    useLatestDocuments({ length: 10 });                      │ │
│  │                                                              │ │
│  │  return (                                                    │ │
│  │    <div>                                                     │ │
│  │      {docs.map(doc => <div>{doc.title}</div>)}              │ │
│  │    </div>                                                    │ │
│  │  );                                                          │ │
│  └──────────────────────┬───────────────────────────────────────┘ │
│                         │                                          │
│                         ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      useLatestDocuments Hook (Custom Hook)                  │ │
│  │                                                              │ │
│  │  - useState: documents, isLoading, error                    │ │
│  │  - useEffect: auto fetch on mount                           │ │
│  │  - fetchLatestDocuments(): async function                   │ │
│  │  - Return: [docs, refetch, state]                           │ │
│  └──────────────────────┬───────────────────────────────────────┘ │
│                         │                                          │
│                         ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      getLatestDocumentsFromAPI (Data Function)              │ │
│  │                                                              │ │
│  │  - Build query params (start, length, sort, sortdir)        │ │
│  │  - Fetch: /api/demplon/documents/latest?params              │ │
│  │  - Transform response to Document[] format                  │ │
│  │  - Return: Promise<Document[]>                              │ │
│  └──────────────────────┬───────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          │ HTTP Request (Internal)
                          │ credentials: 'include'
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Next.js API Route (Server-side)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │    /api/demplon/documents/latest/route.ts                   │ │
│  │                                                              │ │
│  │  1. Get session dari NextAuth                               │ │
│  │  2. Validate accessToken                                    │ │
│  │  3. Parse query params (start, length, sort[], sortdir[])   │ │
│  │  4. Build Demplon URL dengan params                         │ │
│  │  5. Fetch ke Demplon API (server-side, no CORS)            │ │
│  │  6. Handle errors (401, 403, 500)                           │ │
│  │  7. Transform & return response                             │ │
│  │                                                              │ │
│  │  Headers:                                                    │ │
│  │    Authorization: Bearer {session.accessToken}              │ │
│  └──────────────────────┬───────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          │ HTTPS Request (External)
                          │ Authorization: Bearer token
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Demplon API (External)                        │
│                                                                   │
│  https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents  │
│  ?start=0&length=10&sort[]=id&sortdir[]=DESC                    │
│                                                                   │
│  Response:                                                        │
│  {                                                                │
│    "data": [...],              // Array of documents             │
│    "recordsTotal": 150,        // Total records                  │
│    "recordsFiltered": 150,     // After filter                   │
│    "draw": 1                   // Request sequence               │
│  }                                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
User Action → Component Mount
     ↓
useLatestDocuments Hook
     ↓
     ├─ useSession (check auth)
     ├─ useState (init state)
     └─ useEffect (auto fetch)
           ↓
getLatestDocumentsFromAPI(undefined, { start: 0, length: 10 })
     ↓
Build URL: /api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC
     ↓
fetch(url, { credentials: 'include' })
     ↓
     ↓  [Cross Next.js boundary - Client to Server]
     ↓
/api/demplon/documents/latest/route.ts (Server)
     ↓
     ├─ getServerSession(authOptions)
     ├─ Validate accessToken
     ├─ Parse query params
     └─ Build Demplon URL
           ↓
fetch(demplonUrl, {
  headers: { Authorization: 'Bearer token' }
})
     ↓
     ↓  [External API call]
     ↓
Demplon API (https://demplon.pupuk-kujang.co.id/...)
     ↓
Response: { data: [...], recordsTotal: 150, ... }
     ↓
     ↓  [Return through chain]
     ↓
API Route transforms & returns
     ↓
getLatestDocumentsFromAPI receives response
     ↓
     ├─ Transform each item to Document format
     ├─ Calculate reminder metadata
     └─ Return Document[]
           ↓
Hook receives Document[]
     ↓
     ├─ setDocuments(docs)
     ├─ setIsLoading(false)
     └─ Component re-renders
           ↓
UI Updates with new data ✅
```

## Authentication Flow

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│  NextAuth Session   │
│                     │
│  - accessToken      │  ← Token SSO dari Demplon
│  - user.id          │
│  - user.username    │
└──────┬──────────────┘
       │
       │ (Stored in session)
       │
       ▼
┌────────────────────────────────┐
│  Client Request                │
│  credentials: 'include'        │  ← Cookie dikirim otomatis
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│  Server API Route              │
│  getServerSession()            │  ← Ambil session dari cookie
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│  Authorization Header          │
│  Bearer {session.accessToken}  │  ← Token dikirim ke Demplon
└──────┬─────────────────────────┘
       │
       ▼
┌────────────────────────────────┐
│  Demplon API                   │
│  Validate token & return data  │
└────────────────────────────────┘
```

## Error Handling Flow

```
API Request
    ↓
    ├─ No Session? → 401 Unauthorized
    │                 ↓
    │              Redirect to Login
    │
    ├─ No Permission? → 403 Forbidden
    │                    ↓
    │                 Show error + contact admin info
    │
    ├─ API Error? → 500 Internal Server Error
    │                ↓
    │             Show error message + retry button
    │
    └─ Success → 200 OK
                  ↓
               Transform & return data
```

## Component Integration Pattern

```
Dashboard Page
    │
    ├─ QuickAccessSection
    │
    ├─ DocumentView
    │
    ├─ LatestDocumentsWidget  ← NEW!
    │     │
    │     ├─ useLatestDocuments(5)
    │     ├─ Display 5 latest docs
    │     └─ Refresh button → refetch()
    │
    ├─ HeaderSection
    │
    └─ InfoPanel
```

## Pagination Flow

```
User on Page 1 (start=0, length=10)
    ↓
Fetch docs 1-10
    ↓
Display results
    ↓
User clicks "Next" → Page 2 (start=10, length=10)
    ↓
Fetch docs 11-20
    ↓
Display results
    ↓
User clicks "Previous" → Page 1 (start=0, length=10)
    ↓
Fetch docs 1-10 (or use cache)
```

## Load More / Infinite Scroll Flow

```
Initial Load (start=0, length=10)
    ↓
allDocs = [doc1, doc2, ..., doc10]
    ↓
User scrolls down / clicks "Load More"
    ↓
Fetch next batch (start=10, length=10)
    ↓
allDocs = [...allDocs, doc11, doc12, ..., doc20]
    ↓
Update UI with merged data
    ↓
Repeat until no more data
```

## Sorting Flow

```
Request with sort params:
  sort[]=['document_date', 'id']
  sortdir[]=['DESC', 'DESC']
    ↓
Demplon API sorts:
  1. By document_date DESC
  2. Then by id DESC
    ↓
Returns sorted results
    ↓
Display in UI (already sorted)
```

## Cache Strategy (Optional)

```
┌─────────────────────────────────────────┐
│  First Load                             │
│  - Fetch from API                       │
│  - Store in state                       │
│  - Optional: localStorage.setItem()     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│  Subsequent Loads (Same params)         │
│  - Check localStorage first             │
│  - If fresh (< 5 min) → use cache       │
│  - If stale → fetch fresh from API      │
└─────────────────────────────────────────┘
```

## File Organization

```
project/
│
├── src/app/
│   │
│   ├── api/demplon/documents/latest/
│   │   └── route.ts                    ← Server-side API route
│   │
│   └── dashboard/siadil/
│       │
│       ├── data.ts                     ← Data fetching function
│       │   └── getLatestDocumentsFromAPI()
│       │
│       ├── hooks/
│       │   └── useLatestDocuments.ts   ← React hook
│       │
│       ├── components/
│       │   └── LatestDocsWidget.tsx    ← UI component (optional)
│       │
│       └── page.tsx                    ← Main dashboard page
│           └── import & use hook
│
└── docs/
    ├── LATEST_DOCUMENTS_API_GUIDE.md          ← Full documentation
    ├── EXAMPLE_LATEST_DOCUMENTS_USAGE.tsx     ← 6 examples
    ├── LATEST_DOCS_QUICK_REF.md               ← Quick reference
    └── IMPLEMENTATION_SUMMARY_LATEST_DOCS.md  ← This summary
```

## Quick Implementation Checklist

- [x] Create API route (`/api/demplon/documents/latest/route.ts`)
- [x] Add data function (`getLatestDocumentsFromAPI` in `data.ts`)
- [x] Create custom hook (`useLatestDocuments.ts`)
- [x] Write documentation (3 markdown files)
- [x] Create examples (6 use cases)
- [ ] Integrate into dashboard (`page.tsx`)
- [ ] Test with real user session
- [ ] Add UI component (optional)
- [ ] Deploy to production

**Status: Implementation Complete ✅**  
**Ready for Integration! 🚀**
