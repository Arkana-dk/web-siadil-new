# 📍 Penjelasan Endpoint API - SIADIL

## 🎯 Apa Itu Endpoint?

**Endpoint** adalah **alamat URL spesifik** yang digunakan aplikasi untuk berkomunikasi dengan server backend.

### Analogi Sederhana:

Bayangkan **server** seperti **kantor besar**:

- Setiap **ruangan** punya fungsi berbeda
- **Endpoint** = **alamat ruangan** yang spesifik

```
🏢 Kantor (Server):        https://sso.pupuk-kujang.co.id
🚪 Ruang Login:            /login
🚪 Ruang Profile:          /user/profile
🚪 Ruang Logout:           /logout
🚪 Ruang Upload Dokumen:   /documents/upload
```

---

## 📊 Struktur URL Lengkap

```
https://sso.pupuk-kujang.co.id/login
└────────┬────────────────────┘ └──┬──┘
      Base URL               Endpoint
   (Domain + Path)           (Fungsi)
```

### Penjelasan:

| Komponen     | Contoh                   | Keterangan                       |
| ------------ | ------------------------ | -------------------------------- |
| **Protocol** | `https://`               | Protokol komunikasi (secure)     |
| **Domain**   | `sso.pupuk-kujang.co.id` | Alamat server utama              |
| **Endpoint** | `/login`                 | Path spesifik untuk fungsi login |

**URL Lengkap** = Protocol + Domain + Endpoint

---

## 🗂️ Di Mana Endpoint Diletakkan?

### 1️⃣ **File: `.env.local`** (Environment Variables)

**Isi:** BASE URL saja (tanpa endpoint)

```bash
# ✅ BENAR - Base URL saja:
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# ❌ SALAH - Sudah include endpoint:
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id/login
```

**Kenapa base URL saja?**

- Supaya bisa dipakai untuk berbagai endpoint
- Lebih fleksibel dan mudah maintain
- Endpoint spesifik ditambahkan di code

---

### 2️⃣ **File: `src/lib/auth.ts`** (Code Logic)

**Isi:** Code yang menggabungkan Base URL + Endpoint

```typescript
// Ambil base URL dari environment
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// apiUrl = "https://sso.pupuk-kujang.co.id"

// Gabungkan dengan endpoint spesifik:
const response = await fetch(`${apiUrl}/login`, {
  //                                    ^^^^^^
  //                               Endpoint Path
  method: "POST",
  body: JSON.stringify({
    username: "user",
    password: "pass",
  }),
});

// Request dikirim ke:
// https://sso.pupuk-kujang.co.id/login ✅
```

---

## 🔄 Alur Kerja Request

```
┌──────────────────────────────────────────────────────────┐
│ 1. User klik "Login" di browser                          │
└─────────────────┬────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Code di auth.ts mengambil:                            │
│    - Base URL dari .env.local                            │
│    - Endpoint path dari code (/login)                    │
│    - Gabungkan jadi URL lengkap                          │
└─────────────────┬────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Kirim HTTP POST request ke:                           │
│    https://sso.pupuk-kujang.co.id/login                  │
│    dengan data: {username: "...", password: "..."}       │
└─────────────────┬────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Server proses login dan kirim response:               │
│    - Success: {success: true, user: {...}, token: ...}   │
│    - Failed: {success: false, message: "Login gagal"}    │
└─────────────────┬────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────────────────────┐
│ 5. Code di auth.ts proses response:                      │
│    - Jika success: redirect ke dashboard                 │
│    - Jika failed: tampilkan error message                │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Setup Endpoint di Project SIADIL

### **Current Configuration:**

#### `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id
```

#### `src/lib/auth.ts`:

```typescript
const response = await fetch(`${apiUrl}/login`, {
  method: "POST",
  // ...
});
```

#### **Hasil Request:**

```
https://sso.pupuk-kujang.co.id/login ✅
```

---

## 🎯 Contoh Endpoint Lain yang Mungkin Ada

Setelah login berhasil, biasanya ada endpoint lain:

```typescript
// Base URL (dari .env.local)
const apiUrl = "https://sso.pupuk-kujang.co.id";

// Berbagai endpoint:
// 1. Login
await fetch(`${apiUrl}/login`, {...});
// → https://sso.pupuk-kujang.co.id/login

// 2. Logout
await fetch(`${apiUrl}/logout`, {...});
// → https://sso.pupuk-kujang.co.id/logout

// 3. Get User Profile
await fetch(`${apiUrl}/user/profile`, {...});
// → https://sso.pupuk-kujang.co.id/user/profile

// 4. Upload Document
await fetch(`${apiUrl}/documents/upload`, {...});
// → https://sso.pupuk-kujang.co.id/documents/upload

// 5. Get Documents List
await fetch(`${apiUrl}/documents?page=1`, {...});
// → https://sso.pupuk-kujang.co.id/documents?page=1
```

---

## 🔍 Cara Menemukan Endpoint yang Benar

### **1. Tanya Tim Backend**

```
Halo Pak Tono,

Saya sedang integrate login SIADIL.
Bisa info endpoint-endpoint yang tersedia?

Contoh:
- Login: POST /login atau /auth/login?
- Logout: POST /logout?
- Get Profile: GET /user/profile?

Terima kasih
```

### **2. Cek Dokumentasi API**

Biasanya tim backend punya:

- 📄 Swagger/OpenAPI Documentation
- 📁 Postman Collection
- 📝 Document PDF/Word

### **3. Lihat dari Existing Web App**

Jika sudah ada web SIADIL yang jalan:

1. Buka Chrome DevTools (F12)
2. Tab **Network**
3. Coba login
4. Lihat request yang terkirim
5. Copy URL endpoint-nya

---

## ⚙️ Cara Ganti Endpoint

### **Jika Endpoint Berubah:**

**Contoh:** Ternyata endpoint bukan `/login` tapi `/auth/signin`

**Edit `src/lib/auth.ts`:**

```typescript
// Sebelum:
const response = await fetch(`${apiUrl}/login`, {

// Setelah:
const response = await fetch(`${apiUrl}/auth/signin`, {
```

**Base URL di `.env.local` TIDAK perlu diubah!**

---

## 🧪 Test Endpoint dengan Postman

### Setup Request:

```
Method: POST
URL: https://sso.pupuk-kujang.co.id/login

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "username": "your-username",
  "password": "your-password"
}
```

### Expected Response (Success):

```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": "1",
    "username": "admin",
    "name": "Administrator",
    "email": "admin@pupuk-kujang.co.id"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Expected Response (Failed):

```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

---

## 🐛 Troubleshooting

### **Error: JSON Parse Error (HTML Response)**

```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Artinya:**

- ❌ Endpoint salah → Server return HTML page
- ❌ URL mengarah ke web page, bukan API

**Solusi:**

1. Cek endpoint path: `/login` atau `/auth/login` atau path lain?
2. Test di Postman dulu
3. Tanya tim backend

### **Error: 404 Not Found**

```
404 Not Found
```

**Artinya:**

- ❌ Endpoint tidak ada di server

**Solusi:**

- Coba endpoint lain: `/login`, `/auth/login`, `/api/login`
- Konfirmasi dengan tim backend

### **Error: Network Error**

```
Failed to fetch
```

**Artinya:**

- ❌ Tidak bisa konek ke server
- Server down atau network issue

**Solusi:**

1. Test ping: `ping sso.pupuk-kujang.co.id`
2. Cek internet connection
3. Cek apakah perlu VPN

---

## 📝 Checklist Setup Endpoint

- [x] Base URL disimpan di `.env.local` (tanpa endpoint path)
- [x] Endpoint path ditambahkan di code (`src/lib/auth.ts`)
- [ ] Test endpoint di Postman
- [ ] Konfirmasi format request dengan tim backend
- [ ] Konfirmasi format response dengan tim backend
- [ ] Test login dengan credentials valid
- [ ] Handle error response dengan baik

---

## 🎓 Summary

| Konsep              | Penjelasan                            | Contoh                                 |
| ------------------- | ------------------------------------- | -------------------------------------- |
| **Endpoint**        | Alamat spesifik untuk fungsi tertentu | `/login`, `/user/profile`              |
| **Base URL**        | Alamat server utama                   | `https://sso.pupuk-kujang.co.id`       |
| **Full URL**        | Base URL + Endpoint                   | `https://sso.pupuk-kujang.co.id/login` |
| **Di `.env.local`** | Simpan Base URL saja                  | ✅ Tanpa endpoint                      |
| **Di Code**         | Gabungkan Base + Endpoint             | `${apiUrl}/login`                      |

---

## 🚀 Next Steps

1. **Restart server** (jika belum):

   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Test di Postman** (recommended):

   - Method: POST
   - URL: `https://sso.pupuk-kujang.co.id/login`
   - Body: `{"username": "...", "password": "..."}`

3. **Test di aplikasi**:

   - Buka: `http://localhost:3000/login`
   - Input credentials
   - Check console browser (F12) untuk error messages

4. **Jika ada error**:
   - Screenshot error message
   - Check Network tab di DevTools
   - Contact tim backend

---

**Good luck! 🎉**

Jika ada pertanyaan atau error, jangan ragu untuk tanya!
