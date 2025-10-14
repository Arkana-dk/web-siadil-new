# 🚀 Quick Reference - Demplon Archives API

## ⚡ Ringkasan Super Cepat

### Endpoint

```
GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
```

### Autentikasi

- ✅ **Authorization Header:** `Bearer <token>`
- ✅ **Cookies:** Dikirim otomatis dengan `credentials: 'include'`

---

## 📁 File yang Dimodifikasi

| File                                | Fungsi                       |
| ----------------------------------- | ---------------------------- |
| `src/lib/api.ts`                    | Tambah Demplon API functions |
| `src/app/dashboard/siadil/types.ts` | Tambah response types        |
| `src/app/dashboard/siadil/data.ts`  | Tambah fetch function        |
| `.env.example`                      | Tambah DEMPLON_API_URL       |

---

## 🔧 Setup

### 1. Environment Variable

```bash
# .env.local
NEXT_PUBLIC_DEMPLON_API_URL=https://demplon.pupuk-kujang.co.id/admin/api
```

### 2. Import

```typescript
import { getArchivesFromAPI } from "@/app/dashboard/siadil/data";
import { useSession } from "next-auth/react";
```

### 3. Usage

```typescript
const { data: session } = useSession();
const archives = await getArchivesFromAPI(session?.accessToken);
```

---

## 🔑 Fungsi Utama

### `demplanApiRequest()` - src/lib/api.ts

**Fungsi:** Generic request handler untuk Demplon API

- ✅ Tambah Authorization header
- ✅ Kirim cookies otomatis
- ✅ Error handling
- ✅ Logging

### `fetchArchives()` - src/lib/api.ts

**Fungsi:** Fetch archives dari `/siadil/archives/`

- ✅ Menggunakan `demplanApiGet()`
- ✅ Return response dari API

### `getArchivesFromAPI()` - src/app/dashboard/siadil/data.ts

**Fungsi:** High-level function dengan transform & fallback

- ✅ Call `fetchArchives()`
- ✅ Transform data ke format internal
- ✅ Fallback ke dummy data jika gagal

---

## 📊 Data Flow

```
User Login
    ↓
Get Access Token (NextAuth Session)
    ↓
Call getArchivesFromAPI(token)
    ↓
fetchArchives(token)
    ↓
demplanApiGet("/siadil/archives/", token)
    ↓
demplanApiRequest() [+ Auth Header + Cookies]
    ↓
Demplon API Response:
[
  {
    "id": 17,
    "slug": "bmuz-tik-teknologi-informasi-komunikasi",
    "code": "TIK",
    "name": "Teknologi, Informasi & Komunikasi",
    "id_parent": null,
    "contributors": [...]
  }
]
    ↓
Validate & Transform Data
    ↓
Return Archive[]
```

---

## 🔐 Security Features

| Feature            | Implementasi              | Lokasi           |
| ------------------ | ------------------------- | ---------------- |
| **Authorization**  | `Bearer ${token}` header  | `api.ts:135-137` |
| **Cookies**        | `credentials: 'include'`  | `api.ts:144`     |
| **Token Storage**  | NextAuth session          | `auth.ts`        |
| **Error Handling** | Try-catch dengan fallback | `data.ts:75-99`  |

---

## 🧪 Testing Checklist

- [ ] Login berhasil dan dapat token
- [ ] Token tersimpan di session
- [ ] Request ke `/siadil/archives/` terkirim
- [ ] Authorization header ada
- [ ] Cookies terkirim
- [ ] Response 200 OK
- [ ] Data ditransform dengan benar
- [ ] Fallback berfungsi jika API error

---

## 🐛 Debugging

### Check Token

```typescript
console.log("Token:", session?.accessToken);
```

### Check Request

```
🔌 Demplon API Request: https://...
🔑 Using token: YES ✅
📦 Response status: 200 OK
```

### Check Response

```
✅ Successfully fetched 15 archives from API
```

---

## 📝 Example Code

Lihat file lengkap: `EXAMPLE_ARCHIVES_USAGE.tsx`

**Quick snippet:**

```typescript
const { data: session } = useSession();
const [archives, setArchives] = useState<Archive[]>([]);

useEffect(() => {
  async function load() {
    if (session?.accessToken) {
      const data = await getArchivesFromAPI(session.accessToken);
      setArchives(data);
    }
  }
  load();
}, [session]);
```

---

## ⚠️ Common Issues

### 1. No Token

**Error:** Token missing  
**Fix:** Pastikan user sudah login dan session available

### 2. 401 Unauthorized

**Error:** Invalid token  
**Fix:** Token expired atau invalid, re-login

### 3. Network Error

**Error:** Cannot connect  
**Fix:** Pastikan VPN aktif untuk internal network

### 4. CORS Error

**Fix:** Backend harus allow origin dari frontend

---

## 🎯 Next APIs to Integrate

- [ ] `/siadil/documents/` - Get documents
- [ ] `/siadil/documents/` (POST) - Create document
- [ ] `/siadil/documents/:id` (PUT) - Update document
- [ ] `/siadil/documents/:id` (DELETE) - Delete document
- [ ] `/siadil/documents/upload` - Upload file

**Template sama, tinggal ganti endpoint!**

---

**Version:** 1.0  
**Date:** 10 Oktober 2025
