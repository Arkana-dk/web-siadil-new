# 🗄️ Integrasi Demplon Archives API

## 📋 Ringkasan

Dokumentasi ini menjelaskan integrasi endpoint **Archives API** dari Demplon ke dalam sistem SIADIL untuk mengambil data arsip perusahaan dengan autentikasi dan cookies yang tepat.

**Endpoint API:** `https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/`

---

## 📂 File yang Dimodifikasi

### 1. **`src/lib/api.ts`** ⭐

**Lokasi:** `c:\Users\ACER\Documents\web\web-siadil\src\lib\api.ts`

**Perubahan yang Ditambahkan:**

#### a) **Konstanta DEMPLON_API_BASE_URL**

```typescript
const DEMPLON_API_BASE_URL =
  process.env.NEXT_PUBLIC_DEMPLON_API_URL ||
  "https://demplon.pupuk-kujang.co.id/admin/api";
```

**Fungsi:**

- Menyimpan base URL untuk API Demplon
- Terpisah dari SSO API URL untuk kejelasan
- Dapat di-override melalui environment variable `NEXT_PUBLIC_DEMPLON_API_URL`

**Letak:** Baris 7-9 (setelah API_BASE_URL)

---

#### b) **Fungsi `demplanApiRequest()`** 🔐

```typescript
export async function demplanApiRequest<T = any>(
  endpoint: string,
  accessToken: string | undefined,
  options: RequestInit = {}
): Promise<T>;
```

**Fungsi:**

- Generic helper untuk semua request ke Demplon API
- **Menambahkan Authorization Header:** `Bearer ${accessToken}`
- **Mengirim Cookies otomatis:** `credentials: 'include'`
- Logging untuk debugging (request URL, status, errors)
- Error handling yang comprehensive

**Komponen Penting:**

1. **Authorization Header:**

   ```typescript
   if (accessToken) {
     headers["Authorization"] = `Bearer ${accessToken}`;
   }
   ```

   - Menambahkan token ke header untuk autentikasi
   - Token diambil dari NextAuth session

2. **Credentials Include:**

   ```typescript
   credentials: "include";
   ```

   - Mengirim cookies otomatis (session cookies, CSRF token, dll)
   - PENTING untuk autentikasi berbasis cookie

3. **Error Handling:**
   - Menangkap response error (4xx, 5xx)
   - Parse error message dari API
   - Logging untuk debugging

**Letak:** Baris 110-158

---

#### c) **Fungsi `demplanApiGet()` / `demplanApiPost()` / `demplanApiPut()` / `demplanApiDelete()`**

```typescript
export async function demplanApiGet<T = any>(
  endpoint: string,
  accessToken: string | undefined
): Promise<T>;
```

**Fungsi:**

- Wrapper functions untuk HTTP methods (GET, POST, PUT, DELETE)
- Menyederhanakan penggunaan API dengan method-specific functions
- Semua menggunakan `demplanApiRequest()` di bawahnya

**Letak:** Baris 160-210

---

#### d) **Fungsi `fetchArchives()`** 📡

```typescript
export async function fetchArchives(accessToken: string | undefined) {
  return demplanApiGet("/siadil/archives/", accessToken);
}
```

**Fungsi:**

- Specific function untuk fetch data archives
- Endpoint: `/siadil/archives/` (relatif terhadap DEMPLON_API_BASE_URL)
- Menggunakan `demplanApiGet()` dengan authorization & cookies
- Return type bisa di-customize dengan generic type

**Full URL yang dipanggil:**

```
https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
```

**Letak:** Baris 220-235

---

### 2. **`src/app/dashboard/siadil/types.ts`** 📝

**Lokasi:** `c:\Users\ACER\Documents\web\web-siadil\src\app\dashboard\siadil\types.ts`

**Perubahan yang Ditambahkan:**

#### a) **Interface `DemplanArchiveResponse`**

```typescript
export interface DemplanArchiveResponse {
  success: boolean;
  data: DemplanArchiveItem[];
  meta?: {
    total: number;
    page?: number;
    limit?: number;
  };
}
```

**Fungsi:**

- Mendefinisikan struktur response dari API Demplon
- `success`: Status request (true/false)
- `data`: Array of archive items
- `meta`: Metadata opsional (pagination, total records)

**Letak:** Baris 60-68

---

#### b) **Interface `ArchiveContributor`**

```typescript
export interface ArchiveContributor {
  id: number;
  id_archive: number;
  id_user: string; // Bisa user ID atau group ID
  name_user: string;
  mode: "admin" | "editor" | string; // Permission level
  date_created: string;
  last_updated: string;
}
```

**Fungsi:**

- Mendefinisikan struktur contributor dalam archive
- Setiap archive punya array contributors dengan permission (admin/editor)
- `id_user` bisa berupa individual user atau group (contoh: `"group:organization:C001370000"`)

**Letak:** Baris 26-35

---

#### c) **Interface `DemplanArchiveItem`**

```typescript
export interface DemplanArchiveItem {
  id: number;
  slug: string; // URL-friendly identifier
  code: string; // Kode singkat (TIK, HR, dll)
  name: string;
  description: string | null;
  id_section: number | null;
  id_parent: number | null; // Parent archive ID
  date_created: string; // ISO 8601 timestamp
  last_updated: string;
  id_user: string; // Creator user ID
  parent: DemplanArchiveItem | null; // Nested parent
  contributors: ArchiveContributor[]; // Array of contributors
}
```

**Fungsi:**

- Mendefinisikan struktur REAL single archive item dari API perusahaan
- Field sesuai dengan response actual dari Demplon API
- `id_parent` (bukan `parent_id`) untuk hierarchy
- `contributors` array untuk permission management
- `slug` untuk URL-friendly identifier
- Support nested `parent` object

**Response Example dari API Real:**

```json
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
    }
  ]
}
```

**Letak:** Baris 55-70

---

### 3. **`src/app/dashboard/siadil/data.ts`** 🗂️

**Lokasi:** `c:\Users\ACER\Documents\web\web-siadil\src\app\dashboard\siadil\data.ts`

**Perubahan yang Ditambahkan:**

#### a) **Rename `allArchives` → `dummyArchives`**

```typescript
export const dummyArchives: Archive[] = [
  // ... existing dummy data
];

// Backward compatibility
export const allArchives: Archive[] = dummyArchives;
```

**Fungsi:**

- Memisahkan dummy data dengan nama yang jelas
- `allArchives` tetap available untuk backward compatibility
- Dummy data digunakan sebagai fallback jika API gagal

**Letak:** Baris 5-35

---

#### b) **Fungsi `getArchivesFromAPI()`** 🚀

```typescript
export async function getArchivesFromAPI(
  accessToken: string | undefined
): Promise<Archive[]>;
```

**Fungsi:**

- **Fetching real data** dari Demplon API
- Menggunakan `fetchArchives()` dari `api.ts`
- **Transform data** dari format API ke format internal `Archive`
- **Fallback ke dummy data** jika API gagal
- Comprehensive logging untuk debugging

**Proses:**

1. **Call API:**

   ```typescript
   const response = await fetchArchives(accessToken);
   ```

   - Memanggil API dengan authorization header & cookies

2. **Validate Response:**

   ```typescript
   if (response && response.data && Array.isArray(response.data))
   ```

   - Cek apakah response valid dan punya data array

3. **Validate Response Format:**

   ```typescript
   let archivesData: DemplanArchiveItem[] = [];

   if (Array.isArray(response)) {
     archivesData = response; // Direct array
   } else if (response && response.data && Array.isArray(response.data)) {
     archivesData = response.data; // Wrapped in data property
   }
   ```

   - API bisa return direct array ATAU wrapped object
   - Handle kedua format untuk fleksibilitas

4. **Transform Data:**

   ```typescript
   const archives: Archive[] = archivesData.map((item: DemplanArchiveItem) => ({
     id: String(item.id),
     name: item.name,
     code: item.code,
     parentId: item.id_parent ? String(item.id_parent) : "root",
     status: "active",
   }));
   ```

   - Mengubah dari `DemplanArchiveItem` → `Archive`
   - `id_parent` (field actual dari API) digunakan untuk hierarchy
   - Set default `parentId` ke "root" jika null
   - Convert number ID ke string untuk consistency

5. **Error Handling:**
   ```typescript
   catch (error) {
     console.error("❌ Error fetching archives from API:", error);
     return dummyArchives;
   }
   ```
   - Catch semua error (network, parsing, dll)
   - Return dummy data sebagai fallback
   - Aplikasi tetap berjalan meski API down

**Letak:** Baris 56-135

**Field Mapping dari API ke Internal:**
| API Field | Internal Field | Transformation |
|-----------|----------------|----------------|
| `id` (number) | `id` (string) | `String(item.id)` |
| `name` | `name` | Direct copy |
| `code` | `code` | Direct copy |
| `id_parent` (number\|null) | `parentId` (string) | `item.id_parent ? String(item.id_parent) : "root"` |
| - | `status` | Hardcoded `"active"` |

---

## 🔐 Komponen Autentikasi & Keamanan

### 1. **Authorization Header** 🔑

```typescript
headers["Authorization"] = `Bearer ${accessToken}`;
```

**Fungsi:**

- Mengirim access token ke server untuk autentikasi
- Format: `Bearer <token>`
- Token diambil dari NextAuth session

**Alur Token:**

1. User login → API SSO return token
2. Token disimpan di NextAuth session (`session.accessToken`)
3. Token digunakan untuk semua request ke Demplon API

**Lokasi:** `src/lib/api.ts` baris 135-137

---

### 2. **Credentials: Include** 🍪

```typescript
credentials: "include";
```

**Fungsi:**

- Mengirim **cookies otomatis** ke server
- Termasuk: session cookies, CSRF tokens, authentication cookies
- PENTING untuk API yang membutuhkan cookie-based authentication

**Cookies yang Dikirim:**

- Session cookies (user session)
- CSRF protection tokens
- Other authentication cookies

**Lokasi:** `src/lib/api.ts` baris 144

---

### 3. **Error Handling & Logging** 🛡️

```typescript
console.log("🔌 Demplon API Request:", url);
console.log("🔑 Using token:", accessToken ? "YES ✅" : "NO ❌");
console.log("📦 Response status:", response.status);
```

**Fungsi:**

- Logging untuk debugging
- Track request/response flow
- Identify authentication issues
- Monitor API status

**Lokasi:** `src/lib/api.ts` baris 145-152

---

## 📊 Diagram Alur Data

```
┌─────────────┐
│   User      │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Login
       ▼
┌─────────────────┐
│  SSO API        │
│ (pupuk-kujang)  │
└──────┬──────────┘
       │
       │ 2. Return Token
       ▼
┌─────────────────┐
│  NextAuth       │
│  Session        │
│  (accessToken)  │
└──────┬──────────┘
       │
       │ 3. Use Token
       ▼
┌─────────────────┐      4. GET /siadil/archives/      ┌──────────────┐
│  React          │────────────────────────────────────>│  Demplon API │
│  Component      │  Authorization: Bearer <token>      │              │
│                 │  Credentials: include (cookies)     └──────────────┘
└─────────────────┘                                            │
       ▲                                                       │
       │                                                       │
       │                  5. Return Archives Data             │
       └───────────────────────────────────────────────────────┘
```

---

## 🔍 Lokasi File yang Diubah (Summary)

| File         | Lokasi                              | Perubahan                                                               |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------- |
| **api.ts**   | `src/lib/api.ts`                    | Tambah Demplon API functions (base URL, request helpers, fetchArchives) |
| **types.ts** | `src/app/dashboard/siadil/types.ts` | Tambah API response types (DemplanArchiveResponse, DemplanArchiveItem)  |
| **data.ts**  | `src/app/dashboard/siadil/data.ts`  | Tambah getArchivesFromAPI() function dan rename dummy data              |

---

## 🚀 Cara Menggunakan

### 1. **Di dalam Component/Page:**

```typescript
import { useSession } from "next-auth/react";
import { getArchivesFromAPI } from "@/app/dashboard/siadil/data";
import { useEffect, useState } from "react";

export default function ArchivesPage() {
  const { data: session } = useSession();
  const [archives, setArchives] = useState([]);

  useEffect(() => {
    async function loadArchives() {
      if (session?.accessToken) {
        const data = await getArchivesFromAPI(session.accessToken);
        setArchives(data);
      }
    }
    loadArchives();
  }, [session]);

  return (
    <div>
      {archives.map((archive) => (
        <div key={archive.id}>{archive.name}</div>
      ))}
    </div>
  );
}
```

---

### 2. **Environment Variable (Optional):**

Tambahkan di `.env.local` jika ingin override base URL:

```bash
NEXT_PUBLIC_DEMPLON_API_URL=https://demplon.pupuk-kujang.co.id/admin/api
```

---

## 🧪 Testing

### Manual Test:

1. Login ke aplikasi
2. Buka browser DevTools → Network tab
3. Navigate ke halaman yang menggunakan archives
4. Cek request ke `/admin/api/siadil/archives/`
5. Verify headers:
   - `Authorization: Bearer <token>`
   - Cookies included

### Console Logs:

```
🔌 Demplon API Request: https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
🔑 Using token: YES ✅
📦 Response status: 200 OK
✅ Response received successfully
✅ Successfully fetched 15 archives from API
```

---

## ⚠️ Error Handling

### Jika API Gagal:

```
❌ Demplon API Request Error: [Error details]
Using dummy data as fallback
```

**Fallback Behavior:**

- Aplikasi **tidak crash**
- Menggunakan `dummyArchives` sebagai data sementara
- User tetap bisa menggunakan aplikasi
- Developer bisa debug dengan console logs

---

## 🔒 Security Checklist

✅ Authorization header included (Bearer token)  
✅ Cookies sent automatically (credentials: include)  
✅ Token stored securely in NextAuth session  
✅ Error messages don't expose sensitive data  
✅ HTTPS used for all API calls  
✅ Token expiry handled by NextAuth

---

## 📚 Referensi

- **NextAuth.js:** https://next-auth.js.org/
- **Fetch API Credentials:** https://developer.mozilla.org/en-US/docs/Web/API/fetch#credentials
- **Authorization Header:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization

---

## 🎯 Next Steps

1. ✅ Integrasi Archives API (Done)
2. 🔄 Integrasi Documents API
3. 🔄 Integrasi File Upload API
4. 🔄 Integrasi Search API
5. 🔄 Real-time updates dengan WebSocket

---

**Dibuat:** 10 Oktober 2025  
**Author:** GitHub Copilot  
**Version:** 1.0
