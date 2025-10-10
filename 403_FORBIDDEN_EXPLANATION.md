# 🔒 403 FORBIDDEN - Penjelasan & Solusi

## ❌ **Error yang Anda Alami**

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

## 🤔 **Kenapa Bukan Seperti yang Diharapkan?**

### **Yang Anda Harapkan:**

```json
[
  {
    "id": 17,
    "code": "TIK",
    "name": "Teknologi, Informasi & Komunikasi",
    ...
  }
]
```

### **Yang Anda Dapat:**

```json
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

## 📊 **Perbedaan HTTP Status Codes**

| Status               | Arti                                   | Penyebab                                | Solusi                     |
| -------------------- | -------------------------------------- | --------------------------------------- | -------------------------- |
| **401 Unauthorized** | Tidak ada/salah credentials            | Token tidak ada atau invalid            | Login ulang                |
| **403 Forbidden**    | Ada credentials tapi tidak punya akses | Token valid tapi tidak punya permission | Setup permission di server |
| **200 OK**           | Berhasil                               | Token valid & punya akses               | ✅ Success                 |

---

## 🔍 **Diagnosis: Kenapa 403?**

### **✅ Yang Sudah Benar:**

1. **Authentication berhasil** ✅

   - Anda bisa login
   - Token tersimpan di session
   - Request sampai ke Demplon API

2. **Token valid** ✅

   - Kalau token invalid, error-nya 401 (Unauthorized)
   - 403 artinya token VALID, tapi tidak punya PERMISSION

3. **Code sudah benar** ✅
   - Flow: Browser → Next.js API → Demplon API ✅
   - Headers sudah benar: `Authorization: Bearer <token>` ✅
   - Method sudah benar: `GET` ✅

### **❌ Yang Belum Benar:**

**PERMISSION / AUTHORIZATION**

```
SSO Token (Valid) ≠ Demplon Permission (Not Set)
```

---

## 💡 **Penyebab 403 Forbidden**

### **1️⃣ Token SSO ≠ Token Demplon**

**Masalah:**

- Token dari SSO (`sso.pupuk-kujang.co.id`) berbeda sistem dengan Demplon
- SSO bisa authenticate user, tapi Demplon punya sistem permission sendiri
- User valid di SSO, tapi **belum terdaftar** di Demplon

**Analogi:**

```
✅ Anda punya KTP (Token SSO) - Valid
❌ Anda belum punya Kartu Akses Demplon - Forbidden
```

**Solusi:**

- Backend team perlu **integrasi SSO dengan Demplon**
- Atau, perlu **endpoint terpisah** untuk dapat token Demplon

---

### **2️⃣ User Belum Di-Assign ke Demplon**

**Masalah:**

- User Anda terdaftar di SSO
- Tapi **tidak terdaftar** di database Demplon
- Demplon tidak kenal user ID Anda

**Contoh:**

```javascript
// Di SSO
user.id = "12345";
user.username = "admin";
// ✅ Valid

// Di Demplon Database
users = [
  { id: "666", name: "Dwi Susanto" }, // ✅ Terdaftar
  { id: "1", name: "System Admin" }, // ✅ Terdaftar
  { id: "12231149", name: "Personal" }, // ✅ Terdaftar
  // ❌ User "12345" tidak ada
];
```

**Solusi:**

- Admin Demplon perlu **register user** Anda
- Atau, setup **auto-registration** dari SSO

---

### **3️⃣ User Tidak Punya Permission untuk Archives**

**Masalah:**

- User terdaftar di Demplon
- Tapi tidak punya **role/permission** untuk akses `/siadil/archives/`

**Contoh Permission System:**

```javascript
// Di Demplon
permissions = {
  user_666: ["archives.read", "archives.write", "documents.read"], // ✅
  user_12345: ["documents.read"], // ❌ No archives.read
};
```

**Solusi:**

- Admin Demplon perlu **grant permission** `archives.read` ke user Anda

---

### **4️⃣ Endpoint Perlu Token Demplon Spesifik**

**Masalah:**

- Demplon API mungkin perlu token **khusus** dari sistem Demplon
- Bukan token SSO

**Flow yang Benar (mungkin):**

```
1. Login ke SSO → dapat SSO Token
2. POST /demplon/auth/exchange-token
   Body: { ssoToken: "..." }
   → dapat Demplon Token
3. GET /siadil/archives/
   Authorization: Bearer <demplon-token>
   → Success
```

**Solusi:**

- Cek dengan backend team apakah ada endpoint untuk exchange token
- Atau endpoint untuk login ke Demplon menggunakan SSO credentials

---

## 🧪 **Cara Verify Masalahnya**

### **Test 1: Cek User Info**

Tambahkan logging di server untuk cek user details:

```typescript
console.log("User making request:");
console.log("- ID:", session.user.id);
console.log("- Username:", session.user.username);
console.log("- Email:", session.user.email);
console.log("- Roles:", session.user.roles);
```

### **Test 2: Cek Token Content**

Decode JWT token untuk lihat isinya:

```bash
# Di terminal
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | base64 -d
```

Atau gunakan https://jwt.io

**Cek:**

- Apakah ada field `demplon_user_id`?
- Apakah ada field `permissions` atau `roles`?
- Apakah ada field `application: "demplon"`?

### **Test 3: Test dengan User Lain**

Coba login dengan user yang **pasti punya akses** (misal: user "666" - Dwi Susanto dari data yang Anda tunjukkan).

Jika user lain berhasil → masalah di permission user Anda
Jika user lain juga 403 → masalah di integrasi SSO-Demplon

---

## ✅ **Solusi yang Harus Dilakukan**

### **🎯 Yang Harus Anda Lakukan:**

1. **Hubungi Backend Team / Admin Demplon**

   ```
   Subject: Setup Permission untuk Akses Demplon Archives API

   Halo Tim,

   Saya perlu akses ke endpoint:
   GET https://demplon.pupuk-kujang.co.id/admin/api/siadil/archives/

   Saat ini saya mendapat error 403 Forbidden.

   User Details:
   - Username: [username Anda]
   - User ID: [user ID dari SSO]
   - Email: [email Anda]

   Mohon bantuan untuk:
   1. Register user saya di Demplon
   2. Grant permission "archives.read"
   3. Atau setup integrasi SSO → Demplon token

   Terima kasih!
   ```

2. **Verifikasi dengan Backend Team:**

   - Apakah SSO token bisa langsung digunakan untuk Demplon?
   - Atau perlu endpoint exchange token?
   - Atau perlu login terpisah ke Demplon?

3. **Jika Perlu Login Terpisah:**
   - Backend team perlu buatkan endpoint `/api/demplon/auth/login`
   - Endpoint ini login ke Demplon dengan SSO credentials
   - Return token Demplon yang bisa digunakan untuk archives API

---

## 🔧 **Temporary Workaround (Untuk Testing)**

Jika backend team belum setup, Anda bisa test dengan **mock data**:

```typescript
// Di route.ts, tambahkan fallback untuk development
if (response.status === 403 && process.env.NODE_ENV === "development") {
  console.warn("⚠️ Using mock data for development");

  const mockData = [
    {
      id: 17,
      slug: "bmuz-tik-teknologi-informasi-komunikasi",
      code: "TIK",
      name: "Teknologi, Informasi & Komunikasi",
      // ... rest of mock data
    },
  ];

  return NextResponse.json({
    success: true,
    data: mockData,
    isMock: true,
  });
}
```

**PENTING:** Ini hanya untuk **testing UI**, bukan untuk production!

---

## 📋 **Checklist untuk Backend Team**

Berikan checklist ini ke backend team:

- [ ] User sudah terdaftar di Demplon database?
- [ ] User punya role/permission untuk akses archives?
- [ ] SSO token bisa langsung digunakan di Demplon?
- [ ] Jika tidak, ada endpoint untuk exchange token?
- [ ] Jika perlu login terpisah, ada endpoint `/demplon/auth/login`?
- [ ] CORS header sudah di-setup di Demplon API?
- [ ] Rate limiting sudah di-setup?

---

## 🎯 **Expected Flow (Setelah Setup)**

```
1. User Login → SSO
   ↓
2. SSO Return Token
   ↓
3. [OPTIONAL] Exchange Token → Demplon Token
   ↓
4. GET /api/demplon/archives
   ↓
5. API Route → Demplon API (with proper token)
   ↓
6. ✅ Response: [{ id: 17, ... }, { id: 41, ... }]
```

---

## 📞 **Next Steps**

1. ✅ **Hubungi backend team** dengan informasi di atas
2. ✅ **Verifikasi user permission** di Demplon admin
3. ✅ **Test dengan user yang punya akses** (seperti user "666")
4. ✅ **Implement token exchange** jika diperlukan
5. ✅ **Update documentation** setelah setup selesai

---

## 💬 **Kesimpulan**

**Masalahnya BUKAN di code Anda!** ✅

Code Anda sudah **100% benar**. Masalahnya adalah **AUTHORIZATION** yang harus di-setup oleh backend team.

**403 Forbidden = "Saya tahu siapa Anda, tapi Anda tidak boleh akses ini"**

Setelah backend team setup permission, response akan otomatis jadi array archives seperti yang Anda harapkan.
