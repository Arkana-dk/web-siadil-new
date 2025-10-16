# 🧪 Testing Guide - Archives API Implementation

## 🎯 Cara Test Apakah API Sudah Dipanggil

### **Method 1: Debug Panel (PALING MUDAH)** ⭐

1. ✅ Buka aplikasi: `http://localhost:3000`
2. ✅ Login dengan credentials Anda
3. ✅ Navigate ke Siadil page
4. ✅ **Lihat pojok kanan bawah** → Ada Debug Panel
5. ✅ Klik tombol **"📡 Fetch Archives"**
6. ✅ Lihat hasilnya:
   - ✅ Success → Data dari API muncul
   - ❌ Error → Lihat error message

**Debug Panel Features:**

- 📡 **Fetch Archives** - Manual trigger API call
- 🗑️ **Clear Cache & Reload** - Hapus localStorage dan reload
- Info Session & Token status

---

### **Method 2: Console Logs**

1. ✅ Buka aplikasi
2. ✅ Tekan **F12** → Console tab
3. ✅ Login dan navigate ke Siadil
4. ✅ **Lihat console logs:**

#### **Expected Logs (Success):**

```
🔄 usePersistentArchives - Starting load...
🔑 Session available: true
🔑 Access token: YES ✅
📡 Fetching archives from API...
🌐 API will be called with token

📡 getArchivesFromAPI() called
   - Token provided: true
   - Token preview: eyJhbGciOiJIUzI1NiIs...

🔌 Demplon API Request: https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
🔑 Using token: YES ✅
📦 Response status: 200 OK
✅ Response received successfully

📦 Raw API response received
   - Response type: object
   - Is array: true
   - Response: [{id: 17, slug: "...", ...}]

✅ Response is direct array
✅ Successfully fetched 15 archives from API
Sample archive: {id: "17", code: "TIK", name: "Teknologi, Informasi & Komunikasi", ...}

📦 API Response received:
   - Total archives: 15
   - First archive: {id: "17", code: "TIK", ...}
   - Archive codes: TIK, HR, FINANCE, LEGAL, ...

✅ Archives loaded and set to state (15 items)
```

#### **Expected Logs (No Session):**

```
🔄 usePersistentArchives - Starting load...
🔑 Session available: false
🔑 Access token: NO ❌
⏳ No session yet, using dummy data
   - Dummy archives count: 9
```

---

### **Method 3: Network Tab**

1. ✅ Buka aplikasi
2. ✅ Tekan **F12** → Network tab
3. ✅ Filter: **Fetch/XHR**
4. ✅ Login dan navigate ke Siadil
5. ✅ **Cari request:**
   - URL: `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/`
   - Method: `GET`
   - Status: `200 OK`
6. ✅ **Klik request** → Headers tab
7. ✅ **Verify:**
   - Request Headers:
     - `Authorization: Bearer <token>`
     - `Cookie: ...`
   - Response:
     - JSON array dengan archives

---

### **Method 4: Check State dengan React DevTools**

1. ✅ Install React DevTools extension
2. ✅ Buka aplikasi
3. ✅ F12 → Components tab
4. ✅ Cari component `SiadilPage`
5. ✅ Lihat hooks → `useData` → `archives`
6. ✅ **Verify data:**
   - Jika dari API: id numerik (17, 18, 19)
   - Jika dummy: id string ("personal-df", "tik", "legal")

---

## 🔍 Cara Membedakan Data Dummy vs API

### **Data Dummy (Default):**

```javascript
[
  { id: "personal-df", code: "PERSONAL", name: "Personal" },
  { id: "tik", code: "TIK", name: "Teknologi, Informasi & Komunikasi" },
  { id: "legal", code: "Legal", name: "Legal" },
  { id: "finance", code: "Finance", name: "Finance" },
  { id: "hr", code: "HR", name: "Human Resources" },
  // ... 9 items total
];
```

**Karakteristik:**

- ✅ ID string dengan hyphen ("personal-df", "tik-laporan")
- ✅ Total 9 archives
- ✅ Punya "Personal" folder
- ✅ Punya "Arsip Kosong (Test)"

---

### **Data dari API (Real):**

```javascript
[
  { id: "17", code: "TIK", name: "Teknologi, Informasi & Komunikasi" },
  { id: "25", code: "HR", name: "Human Resources" },
  { id: "33", code: "FINANCE", name: "Finance Department" },
  // ... depends on company data
];
```

**Karakteristik:**

- ✅ ID numerik sebagai string ("17", "25", "33")
- ✅ Total tergantung data perusahaan
- ✅ **TIDAK ada** "Personal" folder (kecuali ada di API)
- ✅ **TIDAK ada** "Arsip Kosong (Test)"
- ✅ Data sesuai dengan API perusahaan

---

## 🛠️ Troubleshooting

### **Problem 1: Data Masih Dummy**

**Cek 1: Apakah sudah login?**

```javascript
// Di Console:
const session = JSON.parse(localStorage.getItem("next-auth.session-token"));
console.log(session);
```

**Cek 2: Apakah ada token?**

- Lihat Debug Panel
- Token status harus: ✅ Token

**Cek 3: Clear cache**

- Klik tombol "🗑️ Clear Cache & Reload" di Debug Panel
- ATAU di console:

```javascript
localStorage.removeItem("siadil_archives_storage");
localStorage.removeItem("siadil_archives_fetched");
location.reload();
```

**Cek 4: Lihat console logs**

- Cari error messages
- Cari "Fetching archives from API..."
- Jika tidak ada → Session belum ready

---

### **Problem 2: API Error**

**Error: 401 Unauthorized**

- Token expired → Re-login
- Token invalid → Check auth config

**Error: Network failed**

- VPN not active → Aktifkan VPN
- API endpoint salah → Check URL
- CORS issue → Check backend config

**Error: Cannot read properties of undefined**

- Response format tidak sesuai
- Check console logs untuk raw response

---

### **Problem 3: Infinite Loop / Too Many Requests**

**Jika API dipanggil terus menerus:**

- Bug di useEffect dependency
- Fix: Sudah dihandle dengan proper dependencies

---

## 📊 Expected Behavior

### **Scenario 1: First Time Load (Cold Start)**

```
1. User login
2. usePersistentArchives triggered
3. No localStorage data
4. Fetch from API
5. Save to localStorage
6. Render with API data ✅
```

### **Scenario 2: Page Refresh (Warm Start)**

```
1. Page reload
2. usePersistentArchives triggered
3. localStorage has data
4. Load from localStorage (fast!)
5. Render with cached data ✅
```

**Note:** Currently set to **ALWAYS FETCH** untuk testing purposes.
Untuk production, uncomment localStorage check di hook.

---

## 🎯 Quick Test Commands

### **Test 1: Clear Cache & Reload**

```javascript
localStorage.removeItem("siadil_archives_storage");
localStorage.removeItem("siadil_archives_fetched");
location.reload();
```

### **Test 2: Check Current Archives**

```javascript
const archives = JSON.parse(localStorage.getItem("siadil_archives_storage"));
console.log("Total:", archives.length);
console.log(
  "Codes:",
  archives.map((a) => a.code)
);
console.log(
  "IDs:",
  archives.map((a) => a.id)
);
```

### **Test 3: Manual API Call**

- Use Debug Panel → Click "📡 Fetch Archives"

---

## ✅ Success Criteria

**API berhasil dipanggil jika:**

1. ✅ Console logs menunjukkan "Fetching archives from API..."
2. ✅ Network tab menunjukkan request ke `/siadil/archives/`
3. ✅ Response status: 200 OK
4. ✅ Archives di UI **BUKAN** dummy data (tidak ada "Personal", "Arsip Kosong")
5. ✅ Archives ID numerik ("17", "25") bukan string dengan hyphen
6. ✅ Debug Panel show success message

---

## 🚀 Next Steps After Successful Test

1. ✅ Verify semua archives muncul di UI
2. ✅ Test navigation ke archives
3. ✅ Test create new archive (masih save local)
4. ✅ Implement Documents API
5. ✅ Implement Upload API
6. ✅ Implement CRUD operations dengan API

---

## 📝 Notes

- Debug Panel hanya muncul di **development mode**
- Untuk production, remove debug panel atau wrap dengan feature flag
- Console logs akan banyak untuk memudahkan debugging
- Setelah testing selesai, bisa reduce log verbosity

---

**Last Updated:** 10 Oktober 2025  
**Version:** 1.0
