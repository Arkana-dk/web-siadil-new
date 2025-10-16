# 🔍 Cara Cek dan Aktifkan API Real (Pak Tono)

## 📊 Status Saat Ini

### CEK MODE AUTHENTICATION

**1. Cek di File `.env.local`:**

```bash
NEXT_PUBLIC_USE_MOCK_AUTH=true   ← MOCK MODE (Tidak pakai API)
NEXT_PUBLIC_USE_MOCK_AUTH=false  ← REAL API MODE (Pakai endpoint Pak Tono)
```

**2. Cek di Browser Console (F12):**

Setelah klik tombol "Masuk", lihat console:

**Mock Mode:**

```
🔧 [DEV MODE] Using mock authentication
```

**Real API Mode:**

```
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
```

**3. Cek di Terminal Server:**

Lihat output terminal saat login:

**Mock Mode:**

```
🔧 [DEV MODE] Using mock authentication
POST /api/auth/callback/credentials 200 in 50ms
```

**Real API Mode:**

```
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
POST /api/auth/callback/credentials 401 in 2000ms  ← Kalau gagal
POST /api/auth/callback/credentials 200 in 1500ms  ← Kalau berhasil
```

---

## 🔄 Cara Aktifkan API Real (Endpoint Pak Tono)

### Step 1: Edit `.env.local`

```bash
# Ubah dari true ke false
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

### Step 2: Restart Server

**WAJIB restart server setelah ubah `.env.local`:**

```bash
# Di terminal, tekan Ctrl+C untuk stop server
# Lalu jalankan lagi:
npm run dev
```

### Step 3: Test Login dengan Credentials Real

Sekarang gunakan credentials asli dari sistem Demplon:

- Username: `3082625` (contoh NIP Pak Tono)
- Password: Password asli dari sistem

### Step 4: Verifikasi di Console

**Buka Browser Console (F12) → Tab Console**

Saat klik "Masuk", akan muncul:

```
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
```

**Jika Berhasil:**

```
✅ Login success
{
  success: true,
  user: {
    id: "3082625",
    username: "3082625",
    name: "Tono Sartono",
    pic: "https://statics.pupuk-kujang.co.id/demplon/picemp/3082625.jpg",
    email: "tono@pupuk-kujang.co.id",
    ...
  }
}
```

**Jika Gagal:**

```
❌ Login error: TypeError: fetch failed
Error: Tidak dapat terhubung ke server...
```

---

## 🧪 Testing API Real - Checklist

### Prerequisites:

- [ ] VPN aktif (jika API butuh VPN internal)
- [ ] Koneksi internet stabil
- [ ] Credentials valid dari sistem Demplon

### Test Steps:

1. **Set `.env.local`:**

   ```bash
   NEXT_PUBLIC_USE_MOCK_AUTH=false
   ```

2. **Restart server:**

   ```bash
   npm run dev
   ```

3. **Buka login page:**

   ```
   http://localhost:3002/login
   ```

4. **Buka Browser Console (F12)**

5. **Login dengan credentials real:**

   - Username: NIP Anda
   - Password: Password Anda
   - Klik "Masuk"

6. **Amati Console & Terminal:**
   - Console: Cari log API call
   - Terminal: Cari log request/response

### Expected Results:

**✅ Success:**

- Redirect ke `/dashboard`
- Header menampilkan nama dari API (Tono Sartono)
- Foto profil dari API muncul di sidebar
- Session berisi data lengkap dari API

**❌ Error (Kemungkinan):**

**1. Network Error:**

```
❌ Login error: fetch failed
Tidak dapat terhubung ke server. Pastikan Anda terhubung ke jaringan internal atau VPN.
```

**Solusi:**

- Aktifkan VPN
- Cek koneksi internet
- Test endpoint dengan cURL/Postman

**2. CORS Error:**

```
Access to fetch has been blocked by CORS policy
```

**Solusi:**

- Backend harus whitelist domain Anda
- Hubungi team backend

**3. 401 Unauthorized:**

```
{
  "message": "App is not assigned to this employee or app is does not exist",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**Solusi:**

- Pastikan user memiliki akses ke aplikasi SIADIL
- Hubungi admin untuk assign aplikasi

---

## 🔧 Debug Tools

### 1. Test API dengan cURL (Sebelum pakai di aplikasi)

```bash
curl -X POST https://api.pupuk-kujang.co.id/demplon/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "3082625",
    "password": "YOUR_PASSWORD"
  }'
```

**Success Response:**

```json
{
  "success": true,
  "user": { ... },
  "roles": [...],
  "application": { ... }
}
```

### 2. Test API dengan Postman

**Request:**

```
POST https://api.pupuk-kujang.co.id/demplon/auth/login
Content-Type: application/json

Body:
{
  "username": "3082625",
  "password": "your-password"
}
```

### 3. Enable Debug Mode di NextAuth

File `src/lib/auth.ts` sudah ada:

```typescript
debug: process.env.NODE_ENV === "development";
```

Akan menampilkan detail log di terminal:

```
[next-auth][debug] session
[next-auth][debug] jwt
[next-auth][debug] authorize
```

---

## 📊 Comparison: Mock vs Real API

| Feature          | Mock Mode                 | Real API Mode           |
| ---------------- | ------------------------- | ----------------------- |
| **Username**     | admin / user              | NIP real (3082625)      |
| **Password**     | admin123 / user123        | Password real           |
| **Name**         | Administrator / User Demo | Tono Sartono (dari API) |
| **Photo**        | Fallback inisial          | URL dari API            |
| **Organization** | Mock data                 | Data real dari API      |
| **Network**      | Tidak perlu internet      | Perlu koneksi ke API    |
| **VPN**          | Tidak perlu               | Mungkin perlu           |

---

## 🎯 Quick Check Commands

### Cek current mode:

```bash
cat .env.local | grep USE_MOCK_AUTH
```

### Cek API URL:

```bash
cat .env.local | grep API_URL
```

### Test koneksi ke API:

```bash
ping api.pupuk-kujang.co.id
```

### Test API endpoint (tanpa auth):

```bash
curl -I https://api.pupuk-kujang.co.id/demplon/auth/login
```

---

## 💡 Recommendation

### Untuk Development:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=true  ← Gunakan ini
```

- Tidak perlu VPN
- Tidak perlu credentials real
- Cepat untuk testing UI/UX
- Tidak beban server API

### Untuk Testing Integration:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=false  ← Gunakan ini
```

- Test koneksi API real
- Test response handling
- Test error cases
- Validasi data structure

### Untuk Production:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=false  ← WAJIB false
```

- Harus menggunakan API real
- Credentials real user
- Data real dari database

---

## 📝 Checklist Sebelum Production

- [ ] Set `NEXT_PUBLIC_USE_MOCK_AUTH=false`
- [ ] Test login dengan multiple users
- [ ] Test foto profil load dengan benar
- [ ] Test organization data muncul
- [ ] Test roles & permissions
- [ ] Test error handling
- [ ] Test network timeout
- [ ] Test CORS configuration
- [ ] Setup proper NEXTAUTH_SECRET
- [ ] Setup proper NEXTAUTH_URL

---

**Status Saat Ini:** 🟡 Mock Mode (Development)
**Target:** 🟢 Real API Mode (Production)

**File to Edit:** `.env.local`
**Line to Change:** `NEXT_PUBLIC_USE_MOCK_AUTH=true` → `false`
**Action Required:** Restart server after change
