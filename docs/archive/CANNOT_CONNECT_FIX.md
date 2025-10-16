# 🔍 Troubleshooting: "Tidak dapat terhubung ke server"

## ❌ Error Message

```
Tidak dapat terhubung ke server.
Pastikan Anda terhubung ke jaringan internal atau VPN.
```

---

## 🎯 Penyebab Error

Error ini muncul ketika aplikasi **tidak bisa connect** ke API server backend.

### Kemungkinan Penyebab:

1. ❌ **Domain salah** - Server tidak ada/tidak bisa diakses
2. ❌ **Network issue** - Tidak ada koneksi internet
3. ❌ **CORS issue** - Server block request dari localhost
4. ❌ **Server down** - Backend server sedang maintenance
5. ❌ **Butuh VPN** - Server hanya bisa diakses dari internal network

---

## 🔧 Yang Sudah Diperbaiki

### **Masalah: Domain Salah**

#### ❌ Sebelumnya (SALAH):

```bash
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id
```

**Hasil ping:**

```bash
$ ping sso.pupuk-kujang.co.id
❌ Ping request could not find host
```

→ **Domain tidak ada/tidak bisa diakses!**

---

#### ✅ Sekarang (BENAR):

```bash
NEXT_PUBLIC_API_URL=https://demplon.pupuk-kujang.co.id/web/siadil/api
```

**Hasil ping:**

```bash
$ ping demplon.pupuk-kujang.co.id
✅ Reply from 34.160.213.193: bytes=32 time=4ms
```

→ **Domain bisa diakses!**

---

## 🎯 Full URL yang Akan Dipanggil

```
Base URL:  https://demplon.pupuk-kujang.co.id/web/siadil/api
Endpoint:  /auth/login
─────────────────────────────────────────────────────────────
Final:     https://demplon.pupuk-kujang.co.id/web/siadil/api/auth/login ✅
```

---

## 🚀 Cara Test Sekarang

### 1. **Restart Development Server**

```bash
# Di terminal yang running npm run dev:
Ctrl+C        # Stop server
npm run dev   # Start lagi
```

**Kenapa harus restart?**

- Environment variables di `.env.local` hanya dibaca saat server start
- Perubahan tidak akan apply tanpa restart

---

### 2. **Test di Postman (Recommended)**

Sebelum test di aplikasi, test API endpoint dulu di Postman:

```
Method: POST
URL: https://demplon.pupuk-kujang.co.id/web/siadil/api/auth/login

Headers:
Content-Type: application/json

Body (raw JSON):
{
  "username": "your-username",
  "password": "your-password"
}
```

#### Expected Results:

**✅ Success (200 OK):**

```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {...},
  "token": "..."
}
```

→ **API endpoint benar! Bisa lanjut test di aplikasi**

**❌ 404 Not Found:**

```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

→ **Endpoint path salah. Coba path lain atau tanya backend team**

**❌ HTML Response:**

```html
<!DOCTYPE html>...
```

→ **URL mengarah ke web page, bukan API endpoint**

---

### 3. **Test di Aplikasi**

Setelah server di-restart:

1. Buka browser: `http://localhost:3000/login`
2. **Buka Console dulu** (F12) → Tab Console & Network
3. Input username & password
4. Click Login
5. Lihat di Console & Network tab

#### Lihat di Network Tab:

- Click request yang ke API login
- Check:
  - **Request URL**: Pastikan benar
  - **Status Code**:
    - 200 = Success ✅
    - 404 = Not Found ❌
    - 401 = Wrong credentials ❌
    - 500 = Server error ❌
  - **Response**: JSON atau HTML?

---

## 🔍 Debugging Checklist

### Check 1: Test Ping

```bash
ping demplon.pupuk-kujang.co.id
```

- ✅ Reply from IP → **Server bisa diakses**
- ❌ Request timed out → **Network issue atau butuh VPN**

### Check 2: Test cURL

```bash
curl -X POST https://demplon.pupuk-kujang.co.id/web/siadil/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"test\",\"password\":\"test\"}"
```

- ✅ JSON response → **Endpoint benar**
- ❌ HTML response → **Endpoint salah**
- ❌ Connection refused → **Network issue**

### Check 3: Browser Console

Buka DevTools (F12) → Console:

- Cari error: `fetch failed` atau `CORS`
- Cari error: `404` atau `500`

### Check 4: Network Tab

Buka DevTools (F12) → Network:

- Filter: Fetch/XHR
- Click request "login"
- Check: URL, Status, Response

---

## 📝 Possible Solutions

### Solution 1: Salah Domain ✅ (Sudah Diperbaiki)

```bash
# Ganti dari:
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Menjadi:
NEXT_PUBLIC_API_URL=https://demplon.pupuk-kujang.co.id/web/siadil/api
```

### Solution 2: Salah Endpoint Path

Jika masih 404 setelah restart, coba endpoint lain:

**Edit `src/lib/auth.ts`:**

```typescript
// Coba path lain:
const response = await fetch(`${apiUrl}/login`, {      // Tanpa /auth
// atau
const response = await fetch(`${apiUrl}/api/login`, {  // Dengan /api
```

### Solution 3: CORS Issue

Jika error di console: `CORS policy blocked...`

**Solusi:**

- Test di Postman dulu (Postman tidak kena CORS)
- Minta backend team enable CORS untuk `localhost:3000`
- Atau deploy ke production URL

### Solution 4: Butuh VPN

Jika server hanya bisa diakses internal:

**Solusi:**

- Connect ke VPN kantor
- Atau gunakan mock mode untuk development:
  ```bash
  NEXT_PUBLIC_USE_MOCK_AUTH=true
  ```

---

## 🔄 Alternative: Gunakan Mock Mode

Jika API masih bermasalah, gunakan mock mode untuk development:

### Edit `.env.local`:

```bash
# Ubah ke true untuk mock mode
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

### Mock Credentials:

```
Username: admin
Password: admin123

Username: user
Password: user123
```

---

## 📞 Hubungi Backend Team Jika:

1. Masih dapat error setelah restart server
2. Postman test juga gagal (404 atau 500)
3. Tidak tahu endpoint path yang benar
4. Butuh credentials untuk testing
5. Butuh info tentang VPN/network access

**Tanyakan:**

- ✅ Base URL yang benar
- ✅ Endpoint path untuk login
- ✅ Format request (JSON structure)
- ✅ Format response (JSON structure)
- ✅ CORS enabled untuk localhost?
- ✅ Test credentials

---

## 📊 Summary

| Issue                        | Status                          |
| ---------------------------- | ------------------------------- |
| Domain salah (sso → demplon) | ✅ Fixed                        |
| Base URL di .env.local       | ✅ Updated                      |
| Endpoint path di auth.ts     | ✅ Updated                      |
| Server ping test             | ✅ Success                      |
| **Next Action**              | **Restart server & test login** |

---

## 🚀 Next Steps

1. **Restart server** (Ctrl+C → npm run dev)
2. **Test di Postman** (optional tapi recommended)
3. **Test di aplikasi** (http://localhost:3000/login)
4. **Check console & network** jika ada error
5. **Contact backend team** jika masih gagal

---

**Good luck! 🎉**
