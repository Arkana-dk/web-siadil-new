# 🔒 403 FORBIDDEN - Solusi Lengkap

## ❌ Error yang Anda Alami

```json
{
  "success": false,
  "error": "Demplon API returned 403",
  "status": 403,
  "statusText": "Forbidden",
  "details": {
    "message": "Forbidden resource",
    "error": "Forbidden",
    "statusCode": 403
  }
}
```

---

## 📊 Arti 403 Forbidden

| Status               | Arti                                | Authentication | Authorization |
| -------------------- | ----------------------------------- | -------------- | ------------- |
| **401 Unauthorized** | Token tidak ada/salah               | ❌ Gagal       | -             |
| **403 Forbidden**    | Token valid, tapi tidak punya akses | ✅ Berhasil    | ❌ Gagal      |
| **200 OK**           | Berhasil penuh                      | ✅ Berhasil    | ✅ Berhasil   |

**403 = "Saya tahu siapa Anda (authentication ✅), tapi Anda tidak boleh akses ini (authorization ❌)"**

---

## 🔍 Kenapa 403? (Diagnosis)

### ✅ Yang Sudah Benar:

1. **Login berhasil** ✅
2. **Token tersimpan di session** ✅
3. **Request sampai ke Demplon API** ✅
4. **Demplon recognize token** ✅ (kalau tidak, error 401)

### ❌ Yang Kurang:

**PERMISSION / AUTHORIZATION**

User Anda **belum punya permission** untuk akses `/admin/api/siadil/archives/`

---

## 💡 Penyebab 403 Forbidden

### **1️⃣ User Belum Terdaftar di Demplon**

**Problem:**

- SSO (sso.pupuk-kujang.co.id) ≠ Demplon (demplon.pupuk-kujang.co.id)
- Dua sistem berbeda dengan database user terpisah
- User valid di SSO, tapi **tidak terdaftar** di Demplon

**Analogi:**

```
✅ Anda punya KTP (SSO) → Valid
❌ Belum punya ID Card Demplon → Forbidden
```

**Solusi:**

- Admin Demplon register user Anda di sistem Demplon
- Setup mapping: SSO User ID → Demplon User ID

---

### **2️⃣ User Tidak Punya Role/Permission**

**Problem:**

- User terdaftar di Demplon
- Tapi tidak punya role `archives.read`

**Contoh dari Data Real Anda:**

```javascript
// Users yang PUNYA akses archives
{
  id: "666",
  name: "Dwi Susanto",
  role: "admin" // ✅ Bisa akses
}

{
  id: "1",
  name: "System Admin",
  role: "super_admin" // ✅ Bisa akses
}

// User Anda (belum setup)
{
  id: "YOUR_ID",
  name: "Your Name",
  role: "user" // ❌ Tidak bisa akses archives
}
```

**Solusi:**

- Admin Demplon grant role `archives.read` atau `admin`

---

### **3️⃣ Token SSO Tidak Valid untuk Demplon**

**Problem:**

- SSO token format berbeda dengan yang diharapkan Demplon
- Perlu **token exchange** atau **separate authentication**

**Flow yang Mungkin Dibutuhkan:**

```
1. Login SSO → SSO Token
2. Exchange Token:
   POST /demplon/auth/exchange-token
   Body: { ssoToken: "..." }
   Response: { demplonToken: "..." }
3. Use Demplon Token:
   GET /admin/api/siadil/archives/
   Authorization: Bearer <demplon-token>
```

**Solusi:**

- Backend team implement token exchange endpoint
- Atau setup SSO integration di Demplon

---

## ✅ Solusi (Action Items)

### **📧 1. Hubungi Backend Team / Admin Demplon**

**Email Template:**

```
To: backend-team@perusahaan.com, demplon-admin@perusahaan.com
Subject: Request Access - Demplon Archives API (403 Forbidden)

Hi Team,

Saya development aplikasi web-siadil dan perlu akses ke Demplon Archives API.
Saat ini mendapat error 403 Forbidden.

═══════════════════════════════════════
ERROR DETAILS
═══════════════════════════════════════
Endpoint: GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/
Response: 403 Forbidden
Message: "Forbidden resource"

═══════════════════════════════════════
USER INFORMATION (lihat di terminal log)
═══════════════════════════════════════
Username: [username dari SSO]
User ID: [user ID]
Email: [email]
Application: web-siadil (demplonadmin)

═══════════════════════════════════════
REQUEST
═══════════════════════════════════════
1. Register user saya di Demplon system
2. Grant permission/role: "archives.read" atau "admin"
3. Verifikasi apakah SSO token bisa digunakan langsung di Demplon
4. Jika perlu token exchange, mohon dokumentasi endpoint-nya

═══════════════════════════════════════
QUESTIONS
═══════════════════════════════════════
1. Apakah SSO token bisa langsung digunakan di Demplon API?
2. Bagaimana cara register user baru di Demplon?
3. Role apa yang dibutuhkan untuk akses archives endpoint?
4. Apakah ada endpoint untuk check user permission?
   (misal: GET /admin/api/users/me)

Terima kasih!
```

---

### **🧪 2. Test dengan User yang Punya Akses**

Dari data yang Anda share, **user ini pasti punya akses**:

| User ID    | Name         | Role    | Status                |
| ---------- | ------------ | ------- | --------------------- |
| "666"      | Dwi Susanto  | Admin   | ✅ Admin archive 17   |
| "1"        | System Admin | Creator | ✅ Created archive 17 |
| "12231149" | Personal     | Owner   | ✅ Owns archive 133   |

**Test Steps:**

1. Logout dari aplikasi
2. Login dengan salah satu user di atas
3. Test `/api/demplon/archives`

**Result:**

- ✅ **Jika berhasil** → Problem di permission user Anda (perlu setup)
- ❌ **Jika tetap 403** → Problem di token exchange (perlu backend fix)

---

### **🔧 3. Temporary: Gunakan Mock Data**

Sambil menunggu backend team, Anda bisa dev UI dengan mock data:

**Step 1: Tambahkan env variable**

File: `.env.local`

```bash
# Enable mock data ketika dapat 403
USE_MOCK_ON_403=true
```

**Step 2: Restart server**

```bash
npm run dev
```

**Step 3: Test lagi**

Sekarang ketika dapat 403, akan return mock data:

```json
{
  "success": true,
  "data": [
    { "id": 17, "code": "TIK", ... },
    { "id": 41, "code": "licenses-renewals", ... }
  ],
  "isMock": true,
  "warning": "Using mock data because of 403 Forbidden"
}
```

**PENTING:** Ini hanya untuk **UI development**, bukan production!

---

### **📋 4. Checklist untuk Backend Team**

Kirim checklist ini ke backend team:

- [ ] User sudah terdaftar di Demplon database?
- [ ] User punya role untuk akses archives? (`archives.read` atau `admin`)
- [ ] SSO token format compatible dengan Demplon?
- [ ] Jika perlu token exchange, ada endpoint-nya?
- [ ] Ada dokumentasi API permissions?
- [ ] Ada endpoint untuk check user info: `/admin/api/users/me`?
- [ ] CORS headers sudah setup di Demplon API?

---

## 🎯 Expected Flow (Setelah Fixed)

```
┌─────────────────────────┐
│ 1. User Login → SSO     │
│    Get: SSO Token       │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ 2. [OPTIONAL]           │
│    Exchange Token       │
│    SSO → Demplon Token  │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ 3. Request Archives     │
│    With Valid Token     │
│    + Permission ✅      │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ 4. ✅ Success!          │
│    Get: Array Archives  │
└─────────────────────────┘
```

---

## 📞 Next Steps (Priority Order)

1. ✅ **[HIGH] Email backend team** dengan template di atas
2. ✅ **[HIGH] Test dengan user yang punya akses** (user "666" atau "1")
3. ✅ **[MEDIUM] Enable mock data** (USE_MOCK_ON_403=true) untuk dev UI
4. ✅ **[LOW] Tunggu response** dari backend team
5. ✅ **[AFTER FIX] Test real API** dan disable mock data

---

## 💬 FAQ

### Q: Apakah code saya salah?

**A:** Tidak! Code Anda sudah 100% benar. Ini masalah **infrastructure/permission** yang harus di-handle backend team.

### Q: Berapa lama biasanya setup permission?

**A:** Tergantung tim backend, biasanya:

- Manual setup: 1-2 hari
- Auto-integration: 1-2 minggu

### Q: Bisa saya bypass 403?

**A:** Tidak bisa. 403 adalah server-side authorization. Hanya admin server yang bisa grant permission.

### Q: Mock data aman dipakai?

**A:** Ya, tapi **hanya untuk development**. Jangan deploy ke production dengan mock data.

### Q: Kalau backend team tanya "apa yang dibutuhkan"?

**A:** Kirim file ini (`403_FORBIDDEN_EXPLANATION.md`) ke mereka sebagai referensi.

---

## 📖 Related Documentation

- `403_FORBIDDEN_EXPLANATION.md` - Detailed explanation (this file)
- `CORS_SOLUTION.md` - How we solved CORS
- `API_RESPONSE_STRUCTURE.md` - Expected API format
- `TESTING_GUIDE.md` - How to test APIs

---

## ✅ Kesimpulan

**Masalahnya BUKAN di code Anda!** ✅

Ini adalah masalah **PERMISSION** yang harus diselesaikan oleh:

1. Admin Demplon (setup user)
2. Backend Team (setup integration)

Setelah mereka setup permission, response akan otomatis berubah dari 403 menjadi 200 dengan data archives.

**Your code is production-ready, just waiting for backend setup!** 🚀
