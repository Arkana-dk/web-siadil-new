# 📡 API Configuration & Data Flow

## 🎯 **Base URL Configuration**

Aplikasi menggunakan 2 API berbeda:

### 1. **SSO/Auth API** (Login)

```env
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id
```

**Digunakan untuk:** Authentication (login/logout)

### 2. **Demplon API** (Data Archives & Documents)

```env
NEXT_PUBLIC_DEMPLON_API_URL=https://demplon.pupuk-kujang.co.id/admin/api
```

**Digunakan untuk:** Mengambil data asli dari perusahaan (archives, documents, dll)

---

## 📂 **File Structure & Data Flow**

### **1. Environment Configuration**

**File:** `.env.local`

```bash
# SSO untuk Login
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Demplon untuk Data
NEXT_PUBLIC_DEMPLON_API_URL=https://demplon.pupuk-kujang.co.id/admin/api
```

**Purpose:** Central configuration untuk base URLs

---

### **2. API Utilities**

**File:** `src/lib/api.ts`

```typescript
// Base URL dari .env.local
const DEMPLON_API_BASE_URL =
  process.env.NEXT_PUBLIC_DEMPLON_API_URL ||
  "https://demplon.pupuk-kujang.co.id/admin/api";

// Function untuk fetch archives
export async function fetchArchives() {
  const response = await fetch("/api/demplon/archives", {
    credentials: "include",
    cache: "no-store",
  });
  return response.json();
}

// Function untuk fetch documents
export async function fetchDocuments(options) {
  const response = await fetch(
    `/api/demplon/documents?length=${options.length}`,
    { credentials: "include", cache: "no-store" }
  );
  return response.json();
}
```

**Purpose:** Helper functions untuk API calls (client-side)

---

### **3. Next.js API Routes (Proxy)**

#### **A. Archives API Route**

**File:** `src/app/api/demplon/archives/route.ts`

```typescript
export async function GET(request: Request) {
  // Get session & token
  const session = await getServerSession(authOptions);

  // Call Demplon API (server-side, no CORS!)
  const archivesEndpoint =
    "https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/";

  const response = await fetch(archivesEndpoint, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return NextResponse.json({ success: true, data });
}
```

**Endpoint:** `GET /api/demplon/archives`

**Demplon URL:** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/`

**Purpose:**

- Server-side proxy untuk avoid CORS
- Auto-inject token dari session
- Return data archives (flat array)

---

#### **B. Archives Tree API Route**

**File:** `src/app/api/demplon/archives/tree/route.ts`

```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const tree = searchParams.get("tree") || "true";

  // Call Demplon API dengan tree parameter
  const archivesEndpoint = `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=${tree}`;

  const response = await fetch(archivesEndpoint, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return NextResponse.json({
    success: true,
    data,
    rootCount: data.length,
    isTree: true,
  });
}
```

**Endpoint:** `GET /api/demplon/archives/tree?tree=true`

**Demplon URL:** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=true`

**Purpose:**

- Return archives dengan struktur hierarchical
- Include `children` property untuk sub-folders

---

#### **C. Documents API Route**

**File:** `src/app/api/demplon/documents/route.ts`

```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const length = searchParams.get("length") || "6";
  const reminderActive = searchParams.get("reminder_active") || "true";

  const documentsEndpoint = `https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=${length}&reminder_active=${reminderActive}`;

  const response = await fetch(documentsEndpoint, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();
  return NextResponse.json({ success: true, data });
}
```

**Endpoint:** `GET /api/demplon/documents?length=100&reminder_active=false`

**Demplon URL:** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/`

**Purpose:**

- Return documents dengan pagination
- Support filter by reminder status

---

### **4. Data Fetching Layer**

**File:** `src/app/dashboard/siadil/data.ts`

```typescript
// Fetch archives dari API (via Next.js proxy)
export async function getArchivesFromAPI(
  accessToken?: string
): Promise<Archive[]> {
  const response = await fetch("/api/demplon/archives", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error("Failed to fetch archives");
  }

  // Transform Demplon data format ke internal format
  const archives: Archive[] = result.data.map((item: DemplanArchiveItem) => ({
    id: String(item.id),
    name: item.name,
    code: item.code,
    parentId: item.id_parent ? String(item.id_parent) : "root",
    status: "active",
  }));

  return archives;
}

// Fetch archives tree
export async function getArchivesTreeFromAPI(
  accessToken?: string
): Promise<Archive[]> {
  const response = await fetch("/api/demplon/archives/tree?tree=true", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const result = await response.json();

  // Recursive transform untuk tree structure
  const transformArchiveTree = (item: DemplanArchiveItem): Archive => {
    const archive: Archive = {
      id: String(item.id),
      name: item.name,
      code: item.code,
      parentId: item.id_parent ? String(item.id_parent) : "root",
      status: "active",
    };

    // Transform children recursively
    if (Array.isArray(item.children) && item.children.length > 0) {
      archive.children = item.children.map(transformArchiveTree);
    }

    return archive;
  };

  const archivesTree = result.data.map(transformArchiveTree);
  return archivesTree;
}

// Fetch documents dengan pagination
export async function getDocumentsFromAPI(
  accessToken?: string,
  options?: { start: number; length: number; reminder_active: boolean }
): Promise<{ documents: Document[]; total: number; hasMore: boolean }> {
  const start = options?.start || 0;
  const length = options?.length || 800;
  const reminderActive = options?.reminder_active || false;

  // NOTE: Demplon API tidak support pagination native
  // Kita fetch semua data, lalu pagination di client-side

  const response = await fetch(
    `/api/demplon/documents?length=${length}&reminder_active=${reminderActive}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const result = await response.json();

  // Transform data
  const documents = result.data.map((item: DemplonDocumentItem) => ({
    // Transform dari format Demplon ke format internal
    id: item.id,
    number: item.number,
    title: item.title,
    description: item.description,
    // ... dll
  }));

  return {
    documents,
    total: result.recordsTotal || documents.length,
    hasMore: false, // Semua data sudah diambil
  };
}
```

**Purpose:**

- Bridge antara Next.js API routes dan application logic
- Transform data dari format Demplon ke format internal
- Handle pagination & filtering

---

### **5. React Hooks (State Management)**

**File:** `src/app/dashboard/siadil/hooks/usePersistentArchives.ts`

```typescript
export function usePersistentArchives() {
  const { data: session } = useSession();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArchives() {
      if (session) {
        // Call data fetching layer
        const apiArchives = await getArchivesFromAPI();

        // Save to state & localStorage
        setArchives(apiArchives);
        localStorage.setItem(
          "siadil_archives_storage",
          JSON.stringify(apiArchives)
        );
        setIsLoading(false);
      }
    }

    loadArchives();
  }, [session]);

  return [archives, setArchives, { isLoading }];
}
```

**Purpose:**

- React hook untuk fetch & manage archives state
- Auto-fetch on component mount
- Save to localStorage for caching

---

**File:** `src/app/dashboard/siadil/hooks/usePersistentDocuments.ts`

```typescript
export function usePersistentDocuments() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      if (session) {
        // Fetch ALL documents dengan pagination
        const allDocs = await getAllDocumentsFromAPI(
          undefined,
          (progress) => {
            console.log(`Progress: ${progress.percentage}%`);
          },
          (currentDocs) => {
            // Progressive UI update
            setDocuments(currentDocs);
          }
        );

        setDocuments(allDocs);
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, [session]);

  return [documents, setDocuments, { isLoading }];
}
```

**Purpose:**

- Fetch ALL documents dengan progressive loading
- Update UI setiap page berhasil dimuat
- Cache to localStorage

---

### **6. UI Components (Data Display)**

**File:** `src/app/dashboard/siadil/page.tsx`

```typescript
export default function SiadilPage() {
  // Use hooks untuk fetch data
  const [archives] = usePersistentArchives();
  const [documents] = usePersistentDocuments();

  // Data siap digunakan di UI
  return (
    <div>
      <h1>Archives: {archives.length}</h1>
      <h1>Documents: {documents.length}</h1>

      <DocumentTable documents={documents} />
    </div>
  );
}
```

**Purpose:**

- Consume data dari hooks
- Display dalam UI components

---

## 🔄 **Complete Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER LOGIN                                │
│  Browser → /login → NextAuth → SSO API                         │
│            (sso.pupuk-kujang.co.id)                            │
│  Response: accessToken saved to session                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                2. FETCH ARCHIVES                                │
│                                                                 │
│  Component (page.tsx)                                           │
│       ↓                                                         │
│  Hook (usePersistentArchives.ts)                               │
│       ↓                                                         │
│  Data Layer (data.ts → getArchivesFromAPI)                     │
│       ↓                                                         │
│  Next.js API Route (/api/demplon/archives/route.ts)           │
│       ↓ [SERVER-SIDE, NO CORS]                                │
│  Demplon API (https://demplon.pupuk-kujang.co.id/admin/api)   │
│                /siadil/archives/                               │
│       ↓                                                         │
│  Response: Array of archives (flat atau tree)                  │
│       ↓                                                         │
│  Transform: Demplon format → Internal format                   │
│       ↓                                                         │
│  Save to: React State + localStorage                           │
│       ↓                                                         │
│  Display: UI Components (DocumentTable, etc)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                3. FETCH DOCUMENTS                               │
│                                                                 │
│  [Same flow as Archives]                                        │
│  Endpoint: /siadil/documents/                                  │
│  Features: Pagination, filtering, progressive loading          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ **Verification Checklist**

Pastikan semua endpoint menggunakan Demplon API yang benar:

- [x] **Archives (Flat):** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/`
- [x] **Archives (Tree):** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=true`
- [x] **Documents:** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/`
- [x] **Login:** `https://sso.pupuk-kujang.co.id/api/auth/login`

---

## 🔧 **How to Update API URL**

Jika perlu ganti API URL di masa depan:

### **1. Update `.env.local`:**

```bash
# Ganti URL nya
NEXT_PUBLIC_DEMPLON_API_URL=https://new-api-url.com/admin/api
```

### **2. Restart Server:**

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

### **3. Verify:**

- Check console logs untuk URL yang digunakan
- Test API calls di Network tab (F12)
- Verify data loading correctly

---

## 📚 **Files Reference**

| File                                                       | Purpose         | Demplon API Used              |
| ---------------------------------------------------------- | --------------- | ----------------------------- |
| `.env.local`                                               | Config base URL | N/A                           |
| `src/lib/api.ts`                                           | API utilities   | `DEMPLON_API_BASE_URL`        |
| `src/app/api/demplon/archives/route.ts`                    | Archives proxy  | `/siadil/archives/`           |
| `src/app/api/demplon/archives/tree/route.ts`               | Tree proxy      | `/siadil/archives/?tree=true` |
| `src/app/api/demplon/documents/route.ts`                   | Documents proxy | `/siadil/documents/`          |
| `src/app/dashboard/siadil/data.ts`                         | Data fetching   | All endpoints                 |
| `src/app/dashboard/siadil/hooks/usePersistentArchives.ts`  | Archives state  | Via data.ts                   |
| `src/app/dashboard/siadil/hooks/usePersistentDocuments.ts` | Documents state | Via data.ts                   |
| `src/app/dashboard/siadil/page.tsx`                        | Main UI         | Via hooks                     |

---

## 🎯 **Key Points**

1. ✅ **Semua data REAL** dari Demplon API perusahaan
2. ✅ **No dummy data** - 100% from production database
3. ✅ **Server-side proxy** - No CORS issues
4. ✅ **Auto token injection** - From NextAuth session
5. ✅ **Progressive loading** - UI update setiap page
6. ✅ **Caching** - localStorage untuk performance
7. ✅ **Transformasi data** - Format Demplon → Internal format

---

**Status:** ✅ **PRODUCTION READY**
**Last Updated:** 2025-01-14
**API Source:** Demplon Production Database
