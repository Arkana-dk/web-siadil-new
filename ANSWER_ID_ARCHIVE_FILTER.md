# 🎯 Jawaban: API Filter `id_archive=9`

## ❓ **Pertanyaan User**

```
https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/
  ?length=6
  &reminder_active=true
  &id_archive=9
```

**Apakah dari API ini bisa mengambil semua data di sub-foldernya?**

---

## 🔍 **Quick Answer**

**Belum tahu pasti!** Perlu **test langsung** karena ada **2 kemungkinan**:

### **Kemungkinan A: HANYA Folder #9** ❌

API **TIDAK** include sub-folders:

```
📁 Archive #9 (TIK)
├─ Document A ✅ Diambil (id_archive=9)
├─ Document B ✅ Diambil (id_archive=9)
│
└─ 📂 Sub-Folder (DOKUMENTASI)
   ├─ Document C ❌ TIDAK diambil (id_archive=146)
   └─ Document D ❌ TIDAK diambil (id_archive=146)
```

**Result:** 
- Total documents: **2** (hanya A, B)
- Sub-folder documents: **0** (C, D tidak termasuk)

---

### **Kemungkinan B: Folder #9 + Sub-Folders** ✅

API **AUTO-INCLUDE** sub-folders:

```
📁 Archive #9 (TIK)
├─ Document A ✅ Diambil (id_archive=9)
├─ Document B ✅ Diambil (id_archive=9)
│
└─ 📂 Sub-Folder (DOKUMENTASI)
   ├─ Document C ✅ Diambil juga! (id_archive=146)
   └─ Document D ✅ Diambil juga! (id_archive=146)
```

**Result:** 
- Total documents: **4** (A, B, C, D)
- Sub-folder documents: **2** (C, D termasuk)

---

## 🧪 **Cara Test (UPDATED!)**

Saya sudah **update** test file untuk support **2 format parameter**:

### **Format 1: `id_archive=9`** (Single Value)
```
?id_archive=9
```

### **Format 2: `id_archive[]=9`** (Array Format)
```
?id_archive[]=9
```

**Pertanyaan:** Apakah KEDUA format ini behave sama atau beda?

---

## 📋 **Test Instructions**

### **Step 1: Buka Test File**

```bash
# File path:
test-archive-documents.html

# Double-click atau open di browser
```

### **Step 2: Get Access Token**

1. **Login** ke aplikasi web (Demplon atau SIADIL)
2. **Open DevTools** (F12)
3. **Application tab** → Cookies
4. **Copy token** dari:
   - `next-auth.session-token`, atau
   - `access_token`, atau
   - `__Secure-next-auth.session-token`

### **Step 3: Paste Token**

Paste token ke input field **"Access Token"**

### **Step 4: Run Tests**

Klik salah satu button:

1. **🚀 Test: id_archive[]=9 (Array)**
   - Test format: `?id_archive[]=9`
   
2. **🚀 Test: id_archive=9 (Single)**
   - Test format: `?id_archive=9`
   
3. **🔍 Compare Both Formats** ⭐ **RECOMMENDED**
   - Test KEDUA format sekaligus
   - Auto-compare results
   - Show conclusion

### **Step 5: Analyze Results**

Lihat di section **"Archive Breakdown"**:

```
📁 ROOT FOLDER: TIK
   Archive ID: 9
   Documents: 15

📂 SUB-FOLDER: DOKUMENTASIAPLIKASI
   Archive ID: 146 (Parent: 9)
   Documents: 8
```

**Indicators:**

| Indicator | Kemungkinan A | Kemungkinan B |
|-----------|---------------|---------------|
| **Documents with id_archive=9** | 100% | 50-70% |
| **Documents with id_archive≠9** | 0% | 30-50% |
| **"SUB-FOLDER" label** | ❌ Tidak ada | ✅ Ada |
| **Unique archive IDs** | [9] | [9, 146, 147, ...] |

---

## 📊 **Expected Results**

### **Scenario A: Only Main Folder**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Document A",
      "id_archive": 9,
      "archive": {
        "id": 9,
        "code": "TIK",
        "id_parent": null
      }
    },
    {
      "id": 2,
      "title": "Document B",
      "id_archive": 9,
      "archive": {
        "id": 9,
        "code": "TIK",
        "id_parent": null
      }
    }
  ],
  "total": 2
}
```

**Analysis:**
- ✅ All `id_archive = 9`
- ✅ All `archive.id_parent = null` (ROOT)
- ❌ **TIDAK ada sub-folder documents**

---

### **Scenario B: Main + Sub-Folders**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Document A",
      "id_archive": 9,
      "archive": {
        "id": 9,
        "code": "TIK",
        "id_parent": null
      }
    },
    {
      "id": 2,
      "title": "Document C",
      "id_archive": 146,  // ← BEDA! (sub-folder)
      "archive": {
        "id": 146,
        "code": "DOKUMENTASIAPLIKASI",
        "id_parent": 9  // ← Parent is Archive #9
      }
    }
  ],
  "total": 4
}
```

**Analysis:**
- ✅ Mixed `id_archive` values (9, 146)
- ✅ Some have `archive.id_parent = 9` (CHILDREN)
- ✅ **ADA sub-folder documents!**

---

## 🔍 **Comparison Test**

Button **"🔍 Compare Both Formats"** akan test:

1. **Format Array:** `?id_archive[]=9`
2. **Format Single:** `?id_archive=9`

Dan auto-compare:

```
┌─────────────────────────────────┬─────────────────────────────────┐
│   Format: id_archive[]=9        │   Format: id_archive=9          │
├─────────────────────────────────┼─────────────────────────────────┤
│ Total Docs: 25                  │ Total Docs: 25                  │
│ Main Folder: 15                 │ Main Folder: 15                 │
│ Sub-Folders: 10                 │ Sub-Folders: 10                 │
│ Unique Archives: [9, 146, 147]  │ Unique Archives: [9, 146, 147]  │
│                                 │                                 │
│ ✅ INCLUDES SUB-FOLDERS         │ ✅ INCLUDES SUB-FOLDERS         │
└─────────────────────────────────┴─────────────────────────────────┘

📊 Conclusion:
✅ BOTH formats behave the SAME way
🎉 Both include sub-folders (Scenario B)
```

---

## 💡 **Implementation Impact**

### **If Scenario A (Only Main Folder):**

Kita **TIDAK BISA** pakai single `id_archive` parameter. 

Harus **manual build** multiple archives:

```typescript
// Get archive #9 + all children
const mainArchiveId = 9;
const subFolders = archives.filter(a => a.parentId === mainArchiveId);
const allArchiveIds = [mainArchiveId, ...subFolders.map(s => s.id)];

// Build URL with multiple id_archive[] params
const params = allArchiveIds.map(id => `id_archive[]=${id}`).join('&');
const url = `/documents/?${params}&length=100`;

// Result: ?id_archive[]=9&id_archive[]=146&id_archive[]=147
```

**Pros:**
- ✅ Guaranteed include sub-folders
- ✅ Full control

**Cons:**
- ❌ Complex logic
- ❌ Need to fetch archives first
- ❌ Long URL if many sub-folders

---

### **If Scenario B (Auto-Include Sub-Folders):**

Kita bisa pakai **simple single parameter**:

```typescript
// Simple! Backend handles sub-folders
const url = `/documents/?id_archive=9&length=100`;
```

**Pros:**
- ✅ Simple code
- ✅ Backend handles logic
- ✅ Short URL

**Cons:**
- ❌ Depends on backend behavior
- ❌ Less explicit

---

## 🎯 **Recommendation**

### **Current App Status:**

Aplikasi sekarang **TIDAK pakai** `id_archive` filter:

```typescript
// Current: Fetch ALL documents
const url = `/api/demplon/documents?length=800&reminder_active=false`;
// ← NO id_archive parameter!
```

**Reason:** Fetch ALL documents dari semua archives, lalu filter di frontend.

### **Potential Improvement (If Scenario B):**

Jika API **auto-include sub-folders**, kita bisa **optimize** dengan:

```typescript
// When user clicks specific archive, only fetch relevant documents
const url = `/api/demplon/documents?id_archive=${archiveId}&length=800`;
// ← Faster! Less data transfer
```

**Benefits:**
- ⚡ Faster loading (fetch hanya yang perlu)
- 📉 Less data transfer
- 🎯 More efficient

**Trade-offs:**
- 🔄 Need to re-fetch when switching archives
- 💾 More complex caching

---

## 📁 **Files Updated**

✅ **`test-archive-documents.html`**

**New Features:**
- 🆕 **Test Array Format:** `id_archive[]=9`
- 🆕 **Test Single Format:** `id_archive=9`
- 🆕 **Compare Both:** Side-by-side comparison
- 📊 **Visual Breakdown:** ROOT vs SUB-FOLDER
- ✅ **Auto-Conclusion:** Tells you which scenario

---

## ✅ **Action Items**

### **FOR USER:**

1. ✅ **Open** `test-archive-documents.html` in browser
2. ✅ **Get token** from browser cookies (after login)
3. ✅ **Paste token** to input field
4. ✅ **Click** "🔍 Compare Both Formats" button
5. ✅ **Read** the conclusion section
6. ✅ **Report** hasil test:
   - Apakah include sub-folders?
   - Format mana yang work?
   - Ada perbedaan antara array vs single format?

### **FOR DEVELOPER:**

Wait for test results before deciding:

- **If Scenario A:** Keep current implementation (fetch ALL, filter frontend)
- **If Scenario B:** Consider optimization (fetch by archive when needed)

---

## 📋 **Test Checklist**

Run these tests and check:

- [ ] **Test 1:** `id_archive[]=9` → Count documents with `id_archive ≠ 9`
- [ ] **Test 2:** `id_archive=9` → Count documents with `id_archive ≠ 9`
- [ ] **Test 3:** Compare both → Check if behave the same
- [ ] **Test 4:** Get archive tree → Verify archive #9 has sub-folders
- [ ] **Test 5:** Get archive details → Confirm archive #9 structure

---

## 🎉 **Expected Answer**

Setelah test, kita akan tahu:

### **Question:** 
> Apakah dari API ini untuk mengambil semua data di sub-foldernya?

### **Answer (After Test):**

**Option 1:**
> ✅ **YES!** API `id_archive=9` auto-include semua documents dari sub-folders juga.
> Backend Demplon sudah handle recursive sub-folder query.

**Option 2:**
> ❌ **NO!** API `id_archive=9` HANYA ambil documents yang langsung di folder #9.
> Sub-folder documents TIDAK termasuk. Need manual filtering di app.

---

**Status:** 🧪 **READY FOR TESTING**
**Test File:** `test-archive-documents.html` (UPDATED!)
**New Features:** Compare Array vs Single format
**Next Step:** Run test dan report results

---

## 🔗 **Quick Test URLs**

Test langsung di browser (setelah login):

```bash
# Array format
https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=10&id_archive[]=9

# Single format
https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=10&id_archive=9

# No filter (ALL)
https://demplon.pupuk-kujang.co.id/admin/api/siadil/documents/?length=10
```

**Note:** Need to be logged in, atau pakai Postman dengan Bearer token.
