# Quick Reference: API Archives Tree

## 🚀 Quick Start

### 1. Import Hook

```typescript
import { useArchivesTree } from "@/app/dashboard/siadil/hooks/useArchivesTree";
```

### 2. Gunakan di Component

```typescript
function MyComponent() {
  const [tree, refetch, { isLoading, error, flatArchives }] = useArchivesTree();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Render tree recursively
  const renderTree = (archives: Archive[]) =>
    archives.map((archive) => (
      <div key={archive.id}>
        📁 {archive.name}
        {archive.children && (
          <div style={{ marginLeft: "20px" }}>
            {renderTree(archive.children)}
          </div>
        )}
      </div>
    ));

  return <div>{renderTree(tree)}</div>;
}
```

## 📌 Endpoint

**Demplon API:**

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/?tree=true
```

**Internal Proxy:**

```
GET /api/demplon/archives/tree?tree=true
```

## 🔧 Return Values

Hook mengembalikan:

```typescript
[
  tree, // Archive[] - Hierarchical structure
  refetch, // () => Promise<void> - Refresh function
  {
    isLoading, // boolean
    error, // Error | null
    flatArchives, // Archive[] - Flat list untuk lookup
  },
];
```

## 💡 Common Use Cases

### 1. Sidebar Tree View

```typescript
const [tree] = useArchivesTree();
// Render tree dengan nested structure
```

### 2. Dropdown Select

```typescript
const [, , { flatArchives }] = useArchivesTree();
// Use flatArchives untuk dropdown options
```

### 3. Breadcrumb Navigation

```typescript
const [, , { flatArchives }] = useArchivesTree();
// Build path menggunakan flatArchives lookup
```

### 4. Search in Tree

```typescript
const [tree] = useArchivesTree();
// Filter tree berdasarkan search query
```

## 🔍 Helper Functions

### Flatten Tree

```typescript
function flatten(archives: Archive[]): Archive[] {
  const result: Archive[] = [];
  const traverse = (items: Archive[]) => {
    items.forEach((item) => {
      result.push(item);
      if (item.children) traverse(item.children);
    });
  };
  traverse(archives);
  return result;
}
```

### Find by ID

```typescript
function findById(tree: Archive[], id: string): Archive | null {
  for (const archive of tree) {
    if (archive.id === id) return archive;
    if (archive.children) {
      const found = findById(archive.children, id);
      if (found) return found;
    }
  }
  return null;
}
```

### Get Path

```typescript
function getPath(tree: Archive[], id: string): Archive[] {
  const path: Archive[] = [];
  const search = (items: Archive[]): boolean => {
    for (const item of items) {
      path.push(item);
      if (item.id === id) return true;
      if (item.children && search(item.children)) return true;
      path.pop();
    }
    return false;
  };
  return search(tree) ? path : [];
}
```

## 📁 File Locations

- **Hook:** `src/app/dashboard/siadil/hooks/useArchivesTree.ts`
- **Data Function:** `src/app/dashboard/siadil/data.ts` → `getArchivesTreeFromAPI()`
- **API Route:** `src/app/api/demplon/archives/tree/route.ts`
- **Full Docs:** `ARCHIVES_TREE_API_GUIDE.md`
- **Examples:** `EXAMPLE_ARCHIVES_TREE_USAGE.tsx`

## ⚠️ Common Issues

### 401 Unauthorized

→ User belum login, redirect ke login page

### 403 Forbidden

→ User tidak punya permission di Demplon  
→ Hubungi admin Demplon untuk setup permission

### Children tidak muncul

→ Pastikan parameter `tree=true` ada

### Infinite recursion

→ Validasi data, gunakan Set untuk track visited nodes

## 🎯 Best Practices

1. **Use flatArchives untuk lookup** - O(n) complexity
2. **Memoize render functions** - Avoid re-renders
3. **Add unique keys** - Untuk setiap node
4. **Cache tree structure** - Refetch hanya saat perlu
5. **Handle errors gracefully** - Error boundary

## 📊 Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 17,
      "name": "Parent",
      "code": "PAR",
      "children": [
        {
          "id": 146,
          "name": "Child",
          "code": "CHD",
          "children": []
        }
      ]
    }
  ],
  "rootCount": 1,
  "totalCount": 2,
  "isTree": true
}
```

## 🔄 Tree vs Flat

| Feature   | Flat                    | Tree              |
| --------- | ----------------------- | ----------------- |
| Structure | Array                   | Nested            |
| Use Case  | List                    | Navigation        |
| Endpoint  | `/archives`             | `/archives/tree`  |
| Hook      | `usePersistentArchives` | `useArchivesTree` |

## 📚 Related

- [ARCHIVES_TREE_API_GUIDE.md](./ARCHIVES_TREE_API_GUIDE.md) - Full documentation
- [EXAMPLE_ARCHIVES_TREE_USAGE.tsx](./EXAMPLE_ARCHIVES_TREE_USAGE.tsx) - 7 examples
- [ARCHIVES_TREE_SUMMARY.md](./ARCHIVES_TREE_SUMMARY.md) - Implementation summary
