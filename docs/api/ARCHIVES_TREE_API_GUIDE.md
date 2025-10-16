# Dokumentasi API Archives Tree (Struktur Hierarkis)

## 📋 Ringkasan

API ini digunakan untuk mengambil archives dari sistem Demplon dalam **format tree hierarkis**. Berbeda dengan API archives biasa yang mengembalikan flat list, API ini mengembalikan struktur parent-child yang nested, sangat berguna untuk menampilkan folder tree view atau navigasi hierarkis.

## 🔗 Endpoint

### Endpoint Demplon (Original)

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=true
```

### Endpoint Internal (Proxy)

```
GET /api/demplon/archives/tree?tree=true
```

## 📊 Query Parameters

| Parameter | Tipe    | Default | Deskripsi                                       |
| --------- | ------- | ------- | ----------------------------------------------- |
| `tree`    | boolean | true    | Mengaktifkan format tree hierarkis (wajib true) |

## 📥 Response Structure

### Success Response (Tree Structure)

```json
{
  "success": true,
  "data": [
    {
      "id": 17,
      "slug": "bmuz-tik-teknologi-informasi-komunikasi",
      "code": "TIK",
      "name": "Teknologi, Informasi & Komunikasi",
      "description": "Arsip TIK",
      "id_parent": null,
      "children": [
        {
          "id": 146,
          "slug": "yp4w-dokumentasiaplikasi-dokumentasi-aplikasi",
          "code": "DOKUMENTASIAPLIKASI",
          "name": "Dokumentasi Aplikasi",
          "description": "Dokumentasi Aplikasi",
          "id_parent": 17,
          "children": []
        }
      ]
    },
    {
      "id": 41,
      "slug": "keuangan",
      "code": "KEU",
      "name": "Keuangan",
      "description": "Arsip Keuangan",
      "id_parent": null,
      "children": [
        {
          "id": 42,
          "slug": "laporan-keuangan",
          "code": "LAPKEU",
          "name": "Laporan Keuangan",
          "description": "Laporan Keuangan Tahunan",
          "id_parent": 41,
          "children": []
        }
      ]
    }
  ],
  "rootCount": 2,
  "totalCount": 4,
  "isTree": true,
  "queryParams": {
    "tree": true
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
    "step3": "Berikan permission: 'archives.read'",
    "step4": "Atau setup integrasi SSO-Demplon"
  }
}
```

## 🔑 Authentication

API ini memerlukan authentication melalui NextAuth session. Token akses akan otomatis diambil dari session dan dikirim dalam header `Authorization: Bearer <token>`.

### Prasyarat

- User harus sudah login
- Session harus valid
- User memiliki permission untuk mengakses archives di Demplon

## 💻 Cara Penggunaan

### 1. Menggunakan Hook `useArchivesTree`

Hook ini adalah cara termudah untuk mengambil archives tree di component React.

```typescript
import { useArchivesTree } from "@/app/dashboard/siadil/hooks/useArchivesTree";

function MyComponent() {
  // Auto fetch tree structure saat component mount
  const [tree, refetch, { isLoading, error, flatArchives }] = useArchivesTree();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render tree recursively
  const renderTree = (archives: Archive[]) => {
    return archives.map((archive) => (
      <div key={archive.id} style={{ marginLeft: "20px" }}>
        <h3>
          {archive.name} ({archive.code})
        </h3>
        {archive.children && archive.children.length > 0 && (
          <div>{renderTree(archive.children)}</div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <h2>Archives Tree</h2>
      <button onClick={refetch}>Refresh</button>
      {renderTree(tree)}
    </div>
  );
}
```

### 2. Menggunakan Function `getArchivesTreeFromAPI`

Untuk penggunaan yang lebih flexible di luar React component.

```typescript
import { getArchivesTreeFromAPI } from "@/app/dashboard/siadil/data";

// Ambil archives tree
const tree = await getArchivesTreeFromAPI();

// tree adalah array of root archives dengan children
console.log("Root archives:", tree.length);
console.log("First root:", tree[0]);
console.log("Children of first root:", tree[0].children);
```

### 3. Menggunakan API Route Directly

Untuk custom use case atau dari external service.

```typescript
// Fetch archives tree
const response = await fetch("/api/demplon/archives/tree?tree=true", {
  method: "GET",
  credentials: "include",
  cache: "no-store",
});

const result = await response.json();

if (result.success) {
  console.log("Root count:", result.rootCount);
  console.log("Total count:", result.totalCount);
  console.log("Tree data:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## 📝 Contoh Use Cases

### 1. Sidebar dengan Folder Tree

```typescript
function Sidebar() {
  const [tree, , { isLoading }] = useArchivesTree();

  const renderTreeNode = (archive: Archive, level: number = 0) => {
    return (
      <div key={archive.id} style={{ paddingLeft: `${level * 20}px` }}>
        <div className="folder-item">📁 {archive.name}</div>
        {archive.children &&
          archive.children.map((child) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="sidebar">
      <h3>Folders</h3>
      {isLoading ? <p>Loading...</p> : tree.map((root) => renderTreeNode(root))}
    </div>
  );
}
```

### 2. Dropdown/Select dengan Nested Options

```typescript
function ArchiveSelector() {
  const [tree, , { flatArchives }] = useArchivesTree();

  // Flatten tree untuk dropdown
  return (
    <select>
      <option value="">Pilih Archive</option>
      {flatArchives.map((archive) => (
        <option key={archive.id} value={archive.id}>
          {archive.name} ({archive.code})
        </option>
      ))}
    </select>
  );
}
```

### 3. Breadcrumb dengan Full Path

```typescript
function Breadcrumb({ currentArchiveId }: { currentArchiveId: string }) {
  const [, , { flatArchives }] = useArchivesTree();

  // Build path dari current archive ke root
  const buildPath = (archiveId: string): Archive[] => {
    const path: Archive[] = [];
    let current = flatArchives.find((a) => a.id === archiveId);

    while (current) {
      path.unshift(current);
      if (current.parentId === "root") break;
      current = flatArchives.find((a) => a.id === current!.parentId);
    }

    return path;
  };

  const path = buildPath(currentArchiveId);

  return (
    <div className="breadcrumb">
      <span>Home</span>
      {path.map((archive, index) => (
        <span key={archive.id}>→ {archive.name}</span>
      ))}
    </div>
  );
}
```

### 4. Tree View Component dengan Expand/Collapse

```typescript
function TreeView() {
  const [tree] = useArchivesTree();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderNode = (archive: Archive) => {
    const hasChildren = archive.children && archive.children.length > 0;
    const isExpanded = expanded.has(archive.id);

    return (
      <div key={archive.id} className="tree-node">
        <div
          className="node-header"
          onClick={() => hasChildren && toggleExpand(archive.id)}
        >
          {hasChildren && (
            <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
          )}
          📁 {archive.name}
        </div>

        {hasChildren && isExpanded && (
          <div className="node-children">
            {archive.children!.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  return <div className="tree-view">{tree.map(renderNode)}</div>;
}
```

### 5. Search dalam Tree Structure

```typescript
function SearchableTree() {
  const [tree, , { flatArchives }] = useArchivesTree();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter archives based on search
  const filteredArchives = useMemo(() => {
    if (!searchQuery) return tree;

    const query = searchQuery.toLowerCase();
    const matchingIds = new Set(
      flatArchives
        .filter(
          (a) =>
            a.name.toLowerCase().includes(query) ||
            a.code.toLowerCase().includes(query)
        )
        .map((a) => a.id)
    );

    // Keep parents of matching archives
    flatArchives.forEach((archive) => {
      if (matchingIds.has(archive.id)) {
        let current = archive;
        while (current.parentId && current.parentId !== "root") {
          matchingIds.add(current.parentId);
          current = flatArchives.find((a) => a.id === current.parentId)!;
        }
      }
    });

    // Filter tree based on matching IDs
    const filterTree = (archives: Archive[]): Archive[] => {
      return archives
        .filter((a) => matchingIds.has(a.id))
        .map((a) => ({
          ...a,
          children: a.children ? filterTree(a.children) : undefined,
        }));
    };

    return filterTree(tree);
  }, [tree, searchQuery, flatArchives]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search archives..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* Render filteredArchives */}
    </div>
  );
}
```

## 🔍 Helper Functions

### Flatten Tree

```typescript
function flattenTree(archives: Archive[]): Archive[] {
  const result: Archive[] = [];

  const traverse = (items: Archive[]) => {
    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    }
  };

  traverse(archives);
  return result;
}
```

### Find Archive by ID

```typescript
function findArchiveById(tree: Archive[], id: string): Archive | null {
  for (const archive of tree) {
    if (archive.id === id) return archive;
    if (archive.children) {
      const found = findArchiveById(archive.children, id);
      if (found) return found;
    }
  }
  return null;
}
```

### Get Archive Path

```typescript
function getArchivePath(tree: Archive[], archiveId: string): Archive[] | null {
  const path: Archive[] = [];

  const search = (items: Archive[]): boolean => {
    for (const item of items) {
      path.push(item);

      if (item.id === archiveId) return true;

      if (item.children && search(item.children)) {
        return true;
      }

      path.pop();
    }
    return false;
  };

  return search(tree) ? path : null;
}
```

### Count Total Archives

```typescript
function countArchives(archives: Archive[]): number {
  let count = 0;
  for (const archive of archives) {
    count += 1;
    if (archive.children) {
      count += countArchives(archive.children);
    }
  }
  return count;
}
```

## 🐛 Debugging

### Cek Console Logs

API route akan log informasi detail di console:

```
📡 Fetching archives tree from Demplon API...
👤 User: username (Display Name)
🆔 User ID: 666
📧 User Email: user@example.com
🔑 Token available: true
📊 Query params: { tree: true }
🔌 Calling: https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=true
📦 Response status: 200 OK
✅ Successfully fetched 5 root archives (15 total including children)
```

### Common Issues

#### 1. 401 Unauthorized

**Penyebab:** User belum login atau session expired  
**Solusi:** Redirect ke halaman login

#### 2. 403 Forbidden

**Penyebab:** User tidak memiliki permission di Demplon  
**Solusi:** Hubungi admin Demplon untuk setup permission

#### 3. Children tidak muncul

**Penyebab:** API tidak mengembalikan tree structure  
**Solusi:** Pastikan parameter `tree=true` dikirim

#### 4. Infinite recursion saat render

**Penyebab:** Circular reference di tree structure  
**Solusi:** Validasi data, gunakan Set untuk track visited nodes

## 🚀 Best Practices

1. **Gunakan Hook untuk React Components**

   - Hook `useArchivesTree` sudah handle loading, error, dan refetch
   - Menyediakan both tree dan flat list

2. **Cache Tree Structure**

   - Tree jarang berubah, pertimbangkan caching
   - Refetch hanya saat perlu (user action, not auto)

3. **Flatten untuk Lookup**

   - Gunakan flatArchives untuk find by ID
   - Lebih cepat daripada recursive search

4. **Lazy Load untuk Large Trees**

   - Jika tree sangat besar, load children on demand
   - Gunakan virtualization untuk render

5. **Error Handling**
   - Selalu handle error state di UI
   - Tampilkan pesan error yang user-friendly

## 📚 Related Documentation

- [API_INTEGRATION.md](./API_INTEGRATION.md) - Integrasi API Demplon secara umum
- [ARCHIVES_API_GUIDE.md](./ARCHIVES_API_GUIDE.md) - Guide lengkap Archives API (flat)
- [AUTH_README.md](./AUTH_README.md) - Authentication dan Session management

## 🔄 Changelog

### Version 1.0.0 (2025-10-11)

- ✅ Initial implementation API endpoint `/api/demplon/archives/tree`
- ✅ Hook `useArchivesTree` untuk React components
- ✅ Function `getArchivesTreeFromAPI` untuk data fetching
- ✅ Support hierarchical tree structure dengan children
- ✅ Flat list untuk easy lookup
- ✅ Dokumentasi lengkap dalam bahasa Indonesia
