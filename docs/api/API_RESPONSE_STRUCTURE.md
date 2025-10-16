# 📋 Struktur Response Real - Demplon Archives API

## 🎯 Response Actual dari API Perusahaan

Dokumen ini menjelaskan struktur response **yang sebenarnya** dari API Demplon Archives berdasarkan data real dari perusahaan.

---

## 📦 Response Structure

### **Endpoint:**

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
```

### **Response Type:**

**Direct Array** (bukan wrapped object)

```json
[
  {
    "id": 17,
    "slug": "bmuz-tik-teknologi-informasi-komunikasi",
    "code": "TIK",
    "name": "Teknologi, Informasi & Komunikasi",
    "description": "Teknologi, Informasi & Komunikasi",
    "id_section": null,
    "id_parent": null,
    "date_created": "2024-01-15T02:09:52.000Z",
    "last_updated": "2024-02-13T01:22:41.000Z",
    "id_user": "1",
    "parent": null,
    "contributors": [
      {
        "id": 17,
        "id_archive": 17,
        "id_user": "group:organization:C001370000",
        "name_user": "IT Services Business Partner PKC",
        "mode": "editor",
        "date_created": "2024-01-22T05:31:18.000Z",
        "last_updated": "2024-02-19T13:41:30.000Z"
      },
      {
        "id": 27,
        "id_archive": 17,
        "id_user": "666",
        "name_user": "Dwi Susanto",
        "mode": "admin",
        "date_created": "2024-02-05T12:32:57.000Z",
        "last_updated": "2024-02-05T12:32:57.000Z"
      }
    ]
  }
]
```

---

## 🔍 Field Explanation

### **Archive Fields**

| Field          | Type   | Nullable | Description                                                                   |
| -------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| `id`           | number | ❌ No    | Unique identifier untuk archive                                               |
| `slug`         | string | ❌ No    | URL-friendly identifier (contoh: `"bmuz-tik-teknologi-informasi-komunikasi"`) |
| `code`         | string | ❌ No    | Kode singkat archive (contoh: `"TIK"`, `"HR"`, `"FINANCE"`)                   |
| `name`         | string | ❌ No    | Nama lengkap archive (contoh: `"Teknologi, Informasi & Komunikasi"`)          |
| `description`  | string | ✅ Yes   | Deskripsi detail archive                                                      |
| `id_section`   | number | ✅ Yes   | ID section jika archive ada di dalam section                                  |
| `id_parent`    | number | ✅ Yes   | ID parent archive (null = root level)                                         |
| `date_created` | string | ❌ No    | Timestamp ISO 8601 kapan archive dibuat                                       |
| `last_updated` | string | ❌ No    | Timestamp ISO 8601 kapan archive terakhir diupdate                            |
| `id_user`      | string | ❌ No    | User ID yang membuat archive                                                  |
| `parent`       | object | ✅ Yes   | Nested parent archive object (biasanya null)                                  |
| `contributors` | array  | ❌ No    | Array of contributors dengan permission                                       |

---

### **Contributors Fields**

Setiap archive memiliki array `contributors` yang berisi user/group dengan permission:

| Field          | Type   | Description                                                                    |
| -------------- | ------ | ------------------------------------------------------------------------------ |
| `id`           | number | Unique ID contributor entry                                                    |
| `id_archive`   | number | ID archive yang terkait                                                        |
| `id_user`      | string | User ID atau Group ID (contoh: `"666"` atau `"group:organization:C001370000"`) |
| `name_user`    | string | Nama lengkap user atau group                                                   |
| `mode`         | string | Permission level: `"admin"` atau `"editor"`                                    |
| `date_created` | string | Kapan contributor ditambahkan                                                  |
| `last_updated` | string | Kapan contributor terakhir diupdate                                            |

---

## 🔄 Mapping ke Internal Types

### **API Response → Archive Type**

```typescript
// API Response Field → Internal Archive Type
{
  id: 17                    → id: "17"           // Convert to string
  slug: "bmuz-tik-..."      → (not used)         // Internal tidak pakai slug
  code: "TIK"               → code: "TIK"        // Direct copy
  name: "Teknologi..."      → name: "Teknologi..." // Direct copy
  description: "..."        → (not used)         // Internal tidak ada description
  id_section: null          → (not used)         // Internal tidak ada section
  id_parent: null           → parentId: "root"   // null = root level
  id_parent: 5              → parentId: "5"      // Convert to string
  date_created: "..."       → (not used)         // Internal tidak track timestamps
  last_updated: "..."       → (not used)
  id_user: "1"              → (not used)
  parent: null              → (not used)
  contributors: [...]       → (not used)         // Belum diimplementasi
  (none)                    → status: "active"   // Default value
}
```

---

## 💡 Key Insights

### 1. **Response Format**

- ✅ API return **direct array**, bukan wrapped dalam object `{data: [...]}`
- ✅ Setiap element adalah archive object lengkap

### 2. **Hierarchy System**

- ✅ `id_parent: null` = Archive di root level
- ✅ `id_parent: 17` = Archive adalah child dari archive ID 17
- ✅ Field name adalah `id_parent` (bukan `parent_id`)

### 3. **Contributors System**

- ✅ Setiap archive punya array contributors
- ✅ Contributor bisa individual user (`"666"`) atau group (`"group:organization:C001370000"`)
- ✅ Permission level: `"admin"` atau `"editor"`

### 4. **Timestamps**

- ✅ Format ISO 8601: `"2024-01-15T02:09:52.000Z"`
- ✅ UTC timezone (Z suffix)

### 5. **Slug System**

- ✅ Slug format: `"bmuz-tik-teknologi-informasi-komunikasi"`
- ✅ Slug untuk URL-friendly access
- ✅ Pattern: lowercase, hyphen-separated

---

## 🔧 Code Implementation

### **TypeScript Interface (Updated)**

```typescript
export interface ArchiveContributor {
  id: number;
  id_archive: number;
  id_user: string;
  name_user: string;
  mode: "admin" | "editor" | string;
  date_created: string;
  last_updated: string;
}

export interface DemplanArchiveItem {
  id: number;
  slug: string;
  code: string;
  name: string;
  description: string | null;
  id_section: number | null;
  id_parent: number | null; // ⚠️ PENTING: id_parent bukan parent_id
  date_created: string;
  last_updated: string;
  id_user: string;
  parent: DemplanArchiveItem | null;
  contributors: ArchiveContributor[];
}
```

---

### **Transform Logic (Updated)**

```typescript
export async function getArchivesFromAPI(
  accessToken: string | undefined
): Promise<Archive[]> {
  const response = await fetchArchives(accessToken);

  // Response bisa direct array atau wrapped object
  let archivesData: DemplanArchiveItem[] = [];

  if (Array.isArray(response)) {
    archivesData = response; // ✅ Direct array
  } else if (response?.data && Array.isArray(response.data)) {
    archivesData = response.data; // Wrapped format
  }

  // Transform ke internal format
  const archives: Archive[] = archivesData.map((item) => ({
    id: String(item.id),
    name: item.name,
    code: item.code,
    parentId: item.id_parent ? String(item.id_parent) : "root",
    status: "active",
  }));

  return archives;
}
```

---

## 🧪 Testing Examples

### **Example 1: Root Level Archive**

```json
{
  "id": 17,
  "code": "TIK",
  "name": "Teknologi, Informasi & Komunikasi",
  "id_parent": null // ← Root level
}
```

**Transforms to:**

```typescript
{
  id: "17",
  code: "TIK",
  name: "Teknologi, Informasi & Komunikasi",
  parentId: "root"  // ← null becomes "root"
}
```

---

### **Example 2: Child Archive**

```json
{
  "id": 25,
  "code": "TIK-LAPORAN",
  "name": "Laporan Bulanan TIK",
  "id_parent": 17 // ← Child of archive 17
}
```

**Transforms to:**

```typescript
{
  id: "25",
  code: "TIK-LAPORAN",
  name: "Laporan Bulanan TIK",
  parentId: "17"  // ← Converted to string
}
```

---

### **Example 3: Contributors Handling**

```json
{
  "id": 17,
  "code": "TIK",
  "contributors": [
    {
      "id_user": "group:organization:C001370000",
      "name_user": "IT Services Business Partner PKC",
      "mode": "editor"
    },
    {
      "id_user": "666",
      "name_user": "Dwi Susanto",
      "mode": "admin"
    }
  ]
}
```

**Interpretation:**

- Group `C001370000` has `editor` permission
- User `666` (Dwi Susanto) has `admin` permission

---

## ⚠️ Important Notes

### 1. **Field Naming Convention**

❌ **WRONG:** `parent_id`, `parentId`  
✅ **CORRECT:** `id_parent`

### 2. **Response Format**

❌ **WRONG:** `{success: true, data: [...]}`  
✅ **CORRECT:** `[{...}, {...}]` (direct array)

**Note:** Code sudah handle both formats untuk fleksibilitas

### 3. **ID Type Conversion**

❌ **WRONG:** Keep as number  
✅ **CORRECT:** Convert to string untuk consistency internal

### 4. **Null Parent Handling**

❌ **WRONG:** Leave as `null`  
✅ **CORRECT:** Convert to `"root"`

---

## 📊 Real Data Statistics

Berdasarkan response example:

- ✅ Archive ID: `17`
- ✅ Code: `"TIK"`
- ✅ Total Contributors: `2`
  - 1 Group (editor)
  - 1 Individual User (admin)
- ✅ Hierarchy: Root level (`id_parent: null`)
- ✅ Created: January 15, 2024
- ✅ Last Updated: February 13, 2024

---

## 🚀 Next Steps

### **Untuk Future Development:**

1. **Extend Archive Type untuk Contributors**

   ```typescript
   export type Archive = {
     id: string;
     name: string;
     code: string;
     parentId: string;
     status?: string;
     contributors?: ArchiveContributor[]; // ← Add this
   };
   ```

2. **Implement Permission Checking**

   ```typescript
   function isUserAdmin(archive: Archive, userId: string): boolean {
     return (
       archive.contributors?.some(
         (c) => c.id_user === userId && c.mode === "admin"
       ) ?? false
     );
   }
   ```

3. **Use Slug for Routing**
   ```typescript
   // Route: /dashboard/siadil/archive/:slug
   const url = `/dashboard/siadil/archive/${archive.slug}`;
   ```

---

**Version:** 1.0  
**Last Updated:** 10 Oktober 2025  
**Based on:** Real API Response dari Demplon Production
