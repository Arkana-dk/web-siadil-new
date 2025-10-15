# 🧪 Analysis: Documents by Archive Filter

## 🎯 **Question**

Apakah dengan parameter **`id_archive[]=9`** bisa fetch documents dari:

- ✅ **Folder #9** itu sendiri
- ❓ **SEMUA sub-folder** di bawah folder #9

---

## 📋 **API Endpoint**

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/
  ?start=0
  &length=10
  &sort[]=id
  &sortdir[]=DESC
  &id_archive[]=9
```

### **Parameters:**

| Parameter      | Value | Description                     |
| -------------- | ----- | ------------------------------- |
| `start`        | 0     | Offset untuk pagination         |
| `length`       | 10    | Jumlah documents per page       |
| `sort[]`       | id    | Sort by ID                      |
| `sortdir[]`    | DESC  | Descending order (newest first) |
| `id_archive[]` | 9     | **Filter by archive ID**        |

---

## 🔍 **Expected Behaviors (2 Scenarios)**

### **Scenario A: Filter ONLY Folder #9** ❌ **NOT USEFUL**

API hanya return documents yang **langsung ada di folder #9**:

```
Folder #9 (TIK)
├─ Document A ✅ INCLUDED
├─ Document B ✅ INCLUDED
└─ Sub-Folder (DOKUMENTASIAPLIKASI)
   ├─ Document C ❌ NOT INCLUDED
   └─ Document D ❌ NOT INCLUDED
```

**Result:** Hanya 2 documents (A, B) → **Sub-folder documents TIDAK termasuk**

---

### **Scenario B: Filter Folder #9 + Sub-Folders** ✅ **USEFUL**

API return documents dari **folder #9 + semua sub-foldernya**:

```
Folder #9 (TIK)
├─ Document A ✅ INCLUDED
├─ Document B ✅ INCLUDED
└─ Sub-Folder (DOKUMENTASIAPLIKASI)
   ├─ Document C ✅ INCLUDED
   └─ Document D ✅ INCLUDED
```

**Result:** 4 documents (A, B, C, D) → **Sub-folder documents TERMASUK**

---

## 🧪 **How to Test**

### **Method 1: Using Test HTML File**

1. **Open file:**

   ```bash
   # Double click atau open di browser:
   test-archive-documents.html
   ```

2. **Get Access Token:**

   - Login ke aplikasi web Demplon
   - Open DevTools (F12) → Application → Cookies
   - Copy value dari `next-auth.session-token` atau `access_token`

3. **Paste Token** ke input field

4. **Click "Test WITH id_archive Filter"**

5. **Analyze Results:**
   - Check "Archive Breakdown" section
   - Look for **ROOT FOLDER** vs **SUB-FOLDER** labels
   - Count documents per archive type

---

### **Method 2: Using Postman**

```bash
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?start=0&length=10&id_archive[]=9

Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Content-Type: application/json
```

**Analyze Response:**

```json
{
  "data": [
    {
      "id": 123,
      "title": "Document A",
      "id_archive": 9, // ← Main folder
      "archive": {
        "id": 9,
        "code": "TIK",
        "name": "Teknologi Informasi",
        "id_parent": null // ← ROOT folder
      }
    },
    {
      "id": 124,
      "title": "Document C",
      "id_archive": 146, // ← Sub-folder! (NOT 9)
      "archive": {
        "id": 146,
        "code": "DOKUMENTASIAPLIKASI",
        "name": "Dokumentasi Aplikasi",
        "id_parent": 9 // ← Parent is folder #9
      }
    }
  ],
  "length": 10,
  "total": 25
}
```

**Key Indicators:**

| Indicator                         | Scenario A | Scenario B            |
| --------------------------------- | ---------- | --------------------- |
| **Documents with `id_archive=9`** | ALL (100%) | SOME                  |
| **Documents with `id_archive≠9`** | NONE (0%)  | YES!                  |
| **`archive.id_parent`**           | All `null` | Mix of `null` and `9` |
| **Useful for app?**               | ❌ NO      | ✅ YES                |

---

## 🎯 **Expected Result Analysis**

### **If Scenario A (ONLY Main Folder):**

```json
{
  "data": [
    { "id_archive": 9, "archive": { "id_parent": null } },
    { "id_archive": 9, "archive": { "id_parent": null } },
    { "id_archive": 9, "archive": { "id_parent": null } }
  ]
}
```

**Indicators:**

- ✅ All `id_archive = 9`
- ✅ All `archive.id_parent = null`
- ❌ **NOT what we want** (missing sub-folder docs)

---

### **If Scenario B (Main + Sub-Folders):**

```json
{
  "data": [
    { "id_archive": 9, "archive": { "id": 9, "id_parent": null } },
    { "id_archive": 146, "archive": { "id": 146, "id_parent": 9 } },
    { "id_archive": 147, "archive": { "id": 147, "id_parent": 9 } }
  ]
}
```

**Indicators:**

- ✅ Mix of `id_archive` values (9, 146, 147)
- ✅ Some `archive.id_parent = 9` (children)
- ✅ **This is what we want!**

---

## 💡 **Implementation Strategy**

### **If Scenario A (API doesn't include sub-folders):**

We need to **manually build the filter** in our app:

```typescript
// Step 1: Get all descendant archive IDs
function getAllDescendantIds(archiveId: string, archives: Archive[]): string[] {
  const children = archives
    .filter((a) => a.parentId === archiveId)
    .map((a) => a.id);

  const allDescendants = [...children];
  children.forEach((childId) => {
    allDescendants.push(...getAllDescendantIds(childId, archives));
  });

  return allDescendants;
}

// Step 2: Build API call with multiple id_archive[] params
const archiveIds = [archiveId, ...getAllDescendantIds(archiveId, archives)];

// Example: [9, 146, 147, 148, 149]
const params = archiveIds.map((id) => `id_archive[]=${id}`).join("&");

// Step 3: Call API
const url = `${API_URL}/documents/?${params}&length=100`;
// Result: /documents/?id_archive[]=9&id_archive[]=146&id_archive[]=147...
```

**Pros:**

- ✅ Guaranteed to include sub-folders
- ✅ Full control over filtering

**Cons:**

- ❌ Multiple API parameters (bisa panjang)
- ❌ Need to fetch archives first
- ❌ More complex logic

---

### **If Scenario B (API auto-includes sub-folders):**

We can **directly use** `id_archive[]=9`:

```typescript
// Simple! Just one parameter
const url = `${API_URL}/documents/?id_archive[]=${archiveId}&length=100`;
```

**Pros:**

- ✅ Simple API call
- ✅ Backend handles sub-folder logic
- ✅ Less code

**Cons:**

- ❌ Depends on backend implementation
- ❌ Less control

---

## 🧪 **Test Checklist**

Execute these tests to determine the behavior:

### **Test 1: Check Archive #9 Structure**

```bash
GET /siadil/archives/

# Find archive #9:
{
  "id": 9,
  "code": "TIK",
  "name": "Teknologi Informasi",
  "id_parent": null  // ← ROOT folder
}

# Find children of #9:
{
  "id": 146,
  "code": "DOKUMENTASIAPLIKASI",
  "name": "Dokumentasi Aplikasi",
  "id_parent": 9  // ← Child of TIK
}
```

**Expected:** Archive #9 has **at least 1 sub-folder**

---

### **Test 2: Fetch Documents with Filter**

```bash
GET /siadil/documents/?id_archive[]=9&length=10
```

**Check Response:**

```javascript
// Count unique archive IDs
const uniqueArchiveIds = new Set(data.data.map((d) => d.id_archive));

console.log("Unique archive IDs:", Array.from(uniqueArchiveIds));
// Scenario A: [9]  ← Only main folder
// Scenario B: [9, 146, 147]  ← Main + sub-folders
```

---

### **Test 3: Compare Counts**

```javascript
// Get total documents in folder #9 (direct)
const directDocs = data.data.filter((d) => d.id_archive === 9);

// Get documents in sub-folders (indirect)
const subFolderDocs = data.data.filter((d) => {
  return d.id_archive !== 9 && d.archive?.id_parent === 9;
});

console.log("📊 Results:");
console.log("Direct (in folder #9):", directDocs.length);
console.log("Sub-folders (children of #9):", subFolderDocs.length);
console.log("Total:", data.data.length);

if (subFolderDocs.length > 0) {
  console.log("✅ SCENARIO B: API includes sub-folders!");
} else {
  console.log("❌ SCENARIO A: API only returns direct documents");
}
```

---

## 📊 **Decision Matrix**

| Test Result    | Implementation   | Code Changes Needed                            |
| -------------- | ---------------- | ---------------------------------------------- |
| **Scenario A** | Manual filtering | ✅ Build `id_archive[]` array with descendants |
| **Scenario B** | Direct API call  | ❌ NO changes (already working!)               |

---

## 🎯 **Action Plan**

### **Step 1: Run Test**

```bash
# Open test file in browser
open test-archive-documents.html

# Or run Postman test
```

### **Step 2: Analyze Results**

- [ ] Check "Archive Breakdown" section
- [ ] Count ROOT vs SUB-FOLDER documents
- [ ] Verify `id_archive` values

### **Step 3: Determine Scenario**

```
If sub-folder documents found:
  ✅ Scenario B confirmed
  → No code changes needed
  → API already correct

If ONLY main folder documents:
  ❌ Scenario A confirmed
  → Need to implement manual filtering
  → Update API calls
```

### **Step 4: Implement (if Scenario A)**

Update `data.ts` to build multiple `id_archive[]` parameters:

```typescript
export async function getDocumentsFromAPI(
  accessToken: string,
  options?: {
    archiveId?: string; // NEW parameter
    archiveIds?: string[]; // NEW: Multiple archives
    length?: number;
    start?: number;
  }
): Promise<{ documents: Document[]; total: number; hasMore: boolean }> {
  const archiveParams = options?.archiveIds
    ? options.archiveIds.map((id) => `id_archive[]=${id}`).join("&")
    : options?.archiveId
    ? `id_archive[]=${options.archiveId}`
    : "";

  const url = `/api/demplon/documents?${archiveParams}&start=${start}&length=${length}`;

  // ... rest of code
}
```

---

## 📁 **Test File Created**

✅ **`test-archive-documents.html`**

**Features:**

- 🧪 Test WITH `id_archive` filter
- 🧪 Test WITHOUT filter (all documents)
- 📁 Get archive #9 details
- 🌲 Get full archive tree
- 📊 Visual breakdown (ROOT vs SUB-FOLDER)
- 📋 Raw JSON response

**How to Use:**

1. Open file in browser
2. Paste access token
3. Click "Test WITH id_archive Filter"
4. Analyze results

---

## ✅ **Expected Outcome**

After testing, we will know:

1. ✅ **Does `id_archive[]=9` include sub-folders?**

   - Yes → Scenario B (no changes needed)
   - No → Scenario A (need manual filtering)

2. ✅ **What's the document distribution?**

   - How many in main folder
   - How many in sub-folders
   - Total count

3. ✅ **How to implement in app?**
   - Direct API call (simple)
   - Manual filtering (complex but reliable)

---

**Status:** 🧪 **READY FOR TESTING**
**Test File:** `test-archive-documents.html`
**Next Step:** Run test and report results
