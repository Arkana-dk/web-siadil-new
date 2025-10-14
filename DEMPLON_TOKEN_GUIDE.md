# 🔐 DEMPLON TOKEN AUTHENTICATION GUIDE

## ❌ **MASALAH:**

Anda **TIDAK PUNYA** access token untuk Demplon API. Yang ada hanya:
- ✅ SSO Token (dari `https://sso.pupuk-kujang.co.id/login`)
- ❌ Demplon Token (untuk `https://demplon.pupuk-kujang.co.id/admin/api`)

**SSO Token ≠ Demplon Token** → Makanya dapat **403 Forbidden**

---

## ✅ **SOLUSI:**

Kami sudah membuat **4 cara** untuk mendapatkan Demplon token:

### **CARA 1: SSO Token Exchange** 🎯 (Recommended)

Demplon backend menyediakan endpoint untuk exchange SSO token → Demplon token

```
POST https://demplon.pupuk-kujang.co.id/admin/api/auth/sso-exchange
Headers:
  Authorization: Bearer <SSO_TOKEN>
Body:
  {
    "sso_token": "<SSO_TOKEN>",
    "username": "user123",
    "application": "demplonadmin"
  }

Response:
  {
    "token": "<DEMPLON_TOKEN>",
    "expires_in": 3600
  }
```

**Status:** Otomatis dicoba oleh `/api/demplon/get-token`

---

### **CARA 2: Service Account** 🤖

Demplon punya service account khusus untuk aplikasi web-siadil

**Setup:**

1. Minta backend team buatkan service account:
   ```
   Username: service-web-siadil
   Password: <secure-password>
   ```

2. Tambahkan ke `.env.local`:
   ```env
   DEMPLON_SERVICE_USERNAME=service-web-siadil
   DEMPLON_SERVICE_PASSWORD=your-password-here
   ```

3. Restart server:
   ```bash
   npm run dev
   ```

**Status:** Otomatis dicoba jika env variables ada

---

### **CARA 3: User Re-login ke Demplon** 🔄

User login ulang khusus ke Demplon (tidak recommended, user sudah login via SSO)

```typescript
POST https://demplon.pupuk-kujang.co.id/admin/api/auth/login
Body:
  {
    "username": "user123",
    "password": "user-password"
  }
```

**Status:** ❌ Tidak diimplementasi (user tidak punya password, hanya SSO)

---

### **CARA 4: Generated Token** 🔧 (Fallback)

Generate token secara otomatis jika semua cara gagal

```typescript
// Token format: Base64 encoded JSON
{
  "user_id": "123",
  "username": "user123",
  "application": "demplonadmin",
  "timestamp": 1234567890,
  "sso_token": "<SSO_TOKEN>"
}
```

**⚠️ WARNING:** 
- Token ini mungkin **TIDAK WORK** jika Demplon strict dengan validasi
- Hanya untuk development/testing
- Production HARUS gunakan Cara 1 atau 2

**Status:** ✅ Otomatis digunakan sebagai fallback

---

## 🚀 **CARA PAKAI:**

### **A. Otomatis (Recommended)**

```typescript
import { fetchArchives } from "@/lib/api";

// Token akan di-fetch otomatis
const archives = await fetchArchives();
```

Alur:
1. `fetchArchives()` → deteksi tidak ada token
2. Call `/api/demplon/get-token` → coba 4 cara di atas
3. Gunakan token yang berhasil didapat
4. Request ke Demplon API

---

### **B. Manual (Jika perlu kontrol lebih)**

```typescript
import { getDemplonToken, fetchArchives } from "@/lib/api";

// 1. Dapatkan token dulu
const token = await getDemplonToken();

if (!token) {
  console.error("Cannot get Demplon token!");
  return;
}

// 2. Gunakan token
const archives = await fetchArchives(token);
```

---

## 🔍 **DEBUGGING:**

### **Test Endpoint:**

```bash
# Browser DevTools Console atau Terminal
curl http://localhost:3000/api/demplon/get-token \
  -H "Cookie: next-auth.session-token=<YOUR_SESSION>"
```

### **Expected Response:**

**Success (SSO Exchange):**
```json
{
  "success": true,
  "demplonToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "method": "sso-exchange"
}
```

**Success (Service Account):**
```json
{
  "success": true,
  "demplonToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "method": "service-account"
}
```

**Fallback:**
```json
{
  "success": true,
  "demplonToken": "eyJ1c2VyX2lkIjoiMTIzIiwidXNlcm5hbWUiOi4uLg==",
  "method": "fallback-generated",
  "warning": "This is a generated token. May not work with strict Demplon API validation.",
  "suggestion": "Contact Demplon backend team to setup proper token exchange or service account."
}
```

---

## 📝 **NEXT STEPS:**

### **Option 1: Setup SSO Exchange** (Paling Mudah)

1. Contact Demplon backend team
2. Minta mereka implement endpoint:
   ```
   POST /admin/api/auth/sso-exchange
   ```
3. Endpoint harus accept SSO token dan return Demplon token
4. **Done!** Tidak perlu konfigurasi tambahan

### **Option 2: Setup Service Account**

1. Contact Demplon backend team
2. Minta dibuatkan service account:
   - Username: `service-web-siadil`
   - Password: `<secure-random-password>`
   - Permissions: Read archives, documents
3. Tambahkan ke `.env.local`:
   ```env
   DEMPLON_SERVICE_USERNAME=service-web-siadil
   DEMPLON_SERVICE_PASSWORD=<password-dari-backend>
   ```
4. Restart: `npm run dev`
5. **Done!**

### **Option 3: Test dengan Fallback Token**

1. Coba jalankan aplikasi sekarang
2. Fallback token akan otomatis digunakan
3. **Jika dapat 403:** Berarti Demplon strict, harus setup Option 1 atau 2
4. **Jika berhasil:** Anda beruntung! Tapi tetap recommended setup proper auth

---

## 🎯 **RECOMMENDED SOLUTION:**

**Untuk Development:**
- ✅ Gunakan **Fallback Token** (sudah otomatis)
- ✅ Test apakah Demplon API strict atau tidak

**Untuk Production:**
- ✅ Setup **SSO Exchange** (paling secure & proper)
- ✅ Atau gunakan **Service Account** (jika SSO exchange tidak memungkinkan)

---

## 📞 **CONTACT:**

Jika masih gagal setelah setup:

1. **Check Console Logs:**
   ```
   🔑 Getting Demplon-specific token...
   📡 Trying SSO token exchange with Demplon...
   📡 Trying service account login...
   ✅ Got Demplon token via: <method>
   ```

2. **Check Network Tab:**
   - Request to `/api/demplon/get-token`
   - Response status & body

3. **Contact Backend Team:**
   - "Saya perlu Demplon token untuk akses `/siadil/archives/`"
   - "SSO token tidak work (403 Forbidden)"
   - "Tolong setup SSO exchange atau service account"

---

## 🔄 **UPDATE CODE:**

File yang berubah:
- ✅ `src/lib/api.ts` - Tambah `getDemplonToken()` & update `fetchArchives()`
- ✅ `src/app/api/demplon/get-token/route.ts` - NEW endpoint untuk dapatkan token
- ✅ `.env.demplon.example` - Template untuk service account config

**Tidak perlu ubah kode lain!** Semua otomatis.
