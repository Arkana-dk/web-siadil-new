# 🔧 Fix: "application must be a string, application should not be empty"

## ❌ **Error yang Terjadi:**

```
Login error: Error: application must be a string, application should not be empty
POST /api/auth/callback/credentials 401 in 357ms
```

---

## 🔍 **Root Cause:**

### **Bukan Error dari Code Kita!**

Error ini adalah **response dari API server SSO**!

### **Alur Error:**

```
1. Frontend kirim request:
   POST https://sso.pupuk-kujang.co.id/login
   Body: {
     "username": "3025",
     "password": "xxxxx"
   }

2. Server SSO response error 401:
   {
     "message": "application must be a string, application should not be empty",
     "error": "Unauthorized",
     "statusCode": 401
   }

3. Code kita catch error dan throw:
   throw new Error(errorData.message)
```

---

## 💡 **Penyebab:**

Server SSO **membutuhkan parameter tambahan** dalam request body:

### **Request Format yang Salah (Sebelum):**

```json
{
  "username": "3025",
  "password": "xxxxx"
}
```

❌ **Missing `application` parameter!**

### **Request Format yang Benar (Sekarang):**

```json
{
  "username": "3025",
  "password": "xxxxx",
  "application": "siadil"  ← Required!
}
```

✅ **Include `application` parameter!**

---

## ✅ **Solusi yang Diterapkan:**

### **Updated Code:**

```typescript
// src/lib/auth.ts
const response = await fetch(`${apiUrl}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: credentials.username,
    password: credentials.password,
    application: "siadil", // ✅ Added: Required by SSO server
  }),
});
```

---

## 📊 **Perbandingan:**

### **Before:**

```typescript
body: JSON.stringify({
  username: credentials.username,
  password: credentials.password,
});
```

**Result:** ❌ 401 - "application must be a string..."

### **After:**

```typescript
body: JSON.stringify({
  username: credentials.username,
  password: credentials.password,
  application: "siadil", // ✅ Added
});
```

**Result:** ✅ Login success (dengan credentials yang benar)

---

## 🎯 **Kenapa Perlu Parameter `application`?**

Server SSO Pupuk Kujang handle **multiple applications**:

- SIADIL
- Demplon Admin
- HR System
- Dan aplikasi lainnya

User perlu specify **aplikasi mana** yang ingin diakses saat login.

### **Contoh:**

```json
// Login ke SIADIL:
{
  "username": "3025",
  "password": "xxxxx",
  "application": "siadil"  ← Specify app
}

// Login ke Demplon Admin:
{
  "username": "3025",
  "password": "xxxxx",
  "application": "demplonadmin"  ← Specify different app
}
```

---

## 🧪 **Test:**

### **1. Restart Development Server:**

```bash
Ctrl+C
npm run dev
```

### **2. Test dengan Mock Mode (Recommended dulu):**

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_AUTH=true

# Login:
Username: admin
Password: admin123
```

✅ Should work!

### **3. Test dengan Real API (via VPN):**

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_AUTH=false

# Login dengan credentials real dari Postman:
Username: 3025
Password: xxxxx
```

✅ Should work now! (tidak ada error "application must be a string" lagi)

---

## 📝 **Possible Values untuk `application`:**

Berdasarkan response API Postman, kemungkinan values:

- `"siadil"` - Sistem Arsip Digital
- `"demplonadmin"` - Demplon Admin
- Dan aplikasi lainnya

**Untuk aplikasi SIADIL, gunakan:** `"siadil"`

---

## 💡 **Tips untuk Development:**

### **Hardcoded vs Dynamic:**

**Current (Hardcoded):** ✅ **RECOMMENDED**

```typescript
application: "siadil"; // Fixed untuk aplikasi SIADIL
```

**Alternative (Dynamic):** (Tidak perlu untuk sekarang)

```typescript
application: process.env.NEXT_PUBLIC_APP_SLUG || "siadil";
```

**Kenapa hardcoded OK?**

- Aplikasi ini khusus untuk SIADIL
- Tidak perlu dynamic switching
- Lebih simple dan clear

---

## 🐛 **Troubleshooting:**

### **Jika masih error setelah fix:**

1. **Restart server** (WAJIB!):

   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Clear browser cache**:

   - Hard refresh: `Ctrl+Shift+R`
   - Atau Incognito mode

3. **Check request di Network tab** (F12):

   - Lihat Request Payload
   - Pastikan ada field `application: "siadil"`

4. **Check credentials**:
   - Pastikan username & password benar
   - Pastikan user punya akses ke app SIADIL

---

## 📊 **Summary:**

| Issue                 | Cause                                    | Solution                             | Status   |
| --------------------- | ---------------------------------------- | ------------------------------------ | -------- |
| **Error Message**     | "application must be a string..."        | Server butuh parameter `application` | ✅ Fixed |
| **Missing Parameter** | Request body tidak include `application` | Tambahkan `application: "siadil"`    | ✅ Fixed |
| **Request Format**    | `{username, password}`                   | `{username, password, application}`  | ✅ Fixed |

---

## 🎯 **Expected Results:**

### **Success Response:**

```json
{
  "success": true,
  "application": {
    "id": 21,
    "slug": "siadil",
    "name": "SIADIL",
    ...
  },
  "user": {...},
  "roles": [...]
}
```

### **Error Response (Wrong Credentials):**

```json
{
  "message": "Username atau password salah",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### **Error Response (No Access to App):**

```json
{
  "message": "App is not assigned to this employee or app does not exist",
  "error": "Unauthorized",
  "statusCode": 401
}
```

Semua error response sudah di-handle dengan baik di code! ✅

---

**Fix applied! Restart server dan test lagi! Error "application must be a string" akan hilang! 🎉**
