# 🔌 Cara Koneksi ke Server Real API Demplon

## ✅ **Step-by-Step Guide**

### **Step 1: Test Koneksi ke Server**

Buka **Command Prompt** atau **Terminal** dan jalankan:

```bash
# Test 1: Ping server
ping api.pupuk-kujang.co.id

# Test 2: Curl ke endpoint login
curl -X POST https://api.pupuk-kujang.co.id/demplon/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"password\":\"test\"}"
```

**Expected Result:**

- ✅ Jika bisa akses: Akan ada response dari server (meskipun error credentials)
- ❌ Jika tidak bisa: "Could not resolve host" atau "Connection timeout"

---

### **Step 2: Pastikan Requirements Terpenuhi**

#### **A. Koneksi Network:**

Pilih salah satu:

- [ ] **Option 1: Di Kantor/Jaringan Internal**

  - Konek ke WiFi kantor Pupuk Kujang
  - Atau kabel LAN internal

- [ ] **Option 2: VPN**

  - Install VPN client kantor
  - Connect ke VPN
  - Test ping lagi

- [ ] **Option 3: IP Whitelist**
  - Minta Tim IT whitelist IP public Anda
  - Atau IP range kantor

#### **B. Kredensial Valid:**

Anda butuh:

- ✅ Username yang terdaftar di sistem
- ✅ Password yang benar
- ✅ User sudah aktif di database

---

### **Step 3: Update Environment Variable**

Edit file `.env.local`:

```bash
# Ubah dari true ke false
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

**Full file `.env.local`:**

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# API Configuration
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon

# Development Mode - UBAH INI!
NEXT_PUBLIC_USE_MOCK_AUTH=false  # ← false = pakai API real
```

---

### **Step 4: Restart Server**

**PENTING:** Setelah ubah `.env.local`, HARUS restart server!

```bash
# Stop server (tekan Ctrl+C di terminal yang running npm run dev)

# Lalu start lagi
npm run dev
```

**Kenapa harus restart?**

- Environment variables hanya dibaca saat server start
- Perubahan di `.env.local` tidak auto-reload

---

### **Step 5: Test Login**

1. Buka browser: `http://localhost:3000/login`

2. Lihat di halaman - harusnya **TIDAK ADA** badge "Mode Pengembangan"

3. Masukkan **kredensial real** dari sistem Demplon:

   ```
   Username: [username real Anda]
   Password: [password real Anda]
   ```

4. Klik "Masuk ke Sistem"

---

### **Step 6: Cek Terminal Log**

Perhatikan output di terminal:

#### **Jika Berhasil:**

```bash
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
POST /api/auth/callback/credentials 200 in 150ms
GET /api/auth/session 200 in 50ms
```

#### **Jika Gagal - Network Error:**

```bash
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
❌ Login error: TypeError: fetch failed
```

**Solusi:** Cek koneksi network/VPN

#### **Jika Gagal - Credentials Wrong:**

```bash
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
POST /api/auth/callback/credentials 401 in 100ms
```

**Solusi:** Username/password salah, cek kredensial

---

## 🔍 **Troubleshooting**

### **Problem 1: "Tidak dapat terhubung ke server"**

**Penyebab:**

- Server hanya bisa diakses dari jaringan internal
- Atau butuh VPN

**Solusi:**

```bash
# 1. Test koneksi dulu
ping api.pupuk-kujang.co.id

# 2a. Jika timeout - hubungi IT untuk:
- Setup VPN
- Atau whitelist IP Anda
- Atau develop di kantor

# 2b. Jika bisa ping - cek firewall/antivirus
- Disable sementara untuk test
- Atau allow Node.js di firewall
```

### **Problem 2: CORS Error**

**Error di browser console:**

```
Access to fetch at 'https://api.pupuk-kujang.co.id/demplon/auth/login'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solusi:**
Minta backend team enable CORS:

```javascript
// Backend perlu set headers:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### **Problem 3: SSL Certificate Error**

**Error:**

```
Error: self signed certificate in certificate chain
```

**Solusi (DEVELOPMENT ONLY):**

```bash
# Windows - set environment variable:
set NODE_TLS_REJECT_UNAUTHORIZED=0

# Lalu jalankan:
npm run dev
```

⚠️ **WARNING:** Jangan pakai di production!

### **Problem 4: Wrong Endpoint Path**

**Gejala:** 404 Not Found

**Solusi:** Konfirmasi endpoint yang benar:

```bash
# Kemungkinan endpoint:
https://api.pupuk-kujang.co.id/demplon/auth/login  # ← Current
https://api.pupuk-kujang.co.id/auth/login
https://api.pupuk-kujang.co.id/api/auth/login
https://api.pupuk-kujang.co.id/api/v1/auth/login

# Test manual dengan curl untuk cek mana yang benar
```

---

## 📋 **Checklist Sebelum Connect**

Pastikan semua ini sudah ready:

- [ ] **Network Access**

  - [ ] Di jaringan internal kantor, ATAU
  - [ ] VPN sudah connect, ATAU
  - [ ] IP sudah di-whitelist

- [ ] **Credentials**

  - [ ] Punya username valid
  - [ ] Punya password valid
  - [ ] User sudah aktif di sistem

- [ ] **API Info**

  - [ ] URL endpoint sudah benar
  - [ ] CORS sudah di-enable (jika perlu)
  - [ ] Tahu format request/response

- [ ] **Configuration**
  - [ ] `.env.local` set `NEXT_PUBLIC_USE_MOCK_AUTH=false`
  - [ ] Server sudah di-restart
  - [ ] Badge "Mode Pengembangan" tidak muncul

---

## 🚀 **Quick Commands**

### **Untuk Switch ke Real API:**

```bash
# 1. Edit .env.local
# Ubah NEXT_PUBLIC_USE_MOCK_AUTH=false

# 2. Restart server
Ctrl+C
npm run dev

# 3. Test di browser
http://localhost:3000/login
```

### **Untuk Kembali ke Mock:**

```bash
# 1. Edit .env.local
# Ubah NEXT_PUBLIC_USE_MOCK_AUTH=true

# 2. Restart server
Ctrl+C
npm run dev

# 3. Login dengan mock:
Username: admin
Password: admin123
```

---

## 🎯 **Expected Flow (Real API)**

```
1. User buka /login
   ↓
2. Input username & password real
   ↓
3. Click "Masuk ke Sistem"
   ↓
4. Frontend POST ke Next.js API route
   ↓
5. Next.js forward request ke:
   https://api.pupuk-kujang.co.id/demplon/auth/login
   ↓
6. Backend validate credentials
   ↓
7. Backend return user data + token
   ↓
8. NextAuth save session
   ↓
9. Redirect to /dashboard/siadil
   ↓
10. User logged in ✅
```

---

## 📞 **Kontak untuk Bantuan**

Jika masih gagal, hubungi:

1. **Tim IT** - untuk network/VPN
2. **Backend Developer** - untuk API issues
3. **Pak Tono** - untuk SSO (jika ada)

Siapkan info ini saat lapor:

- Error message lengkap
- Screenshot error
- Terminal log
- Browser console log

---

## 📝 **Summary**

### **Singkatnya:**

1. **Test koneksi** ke server dulu (ping/curl)
2. **Edit `.env.local`**: Set `NEXT_PUBLIC_USE_MOCK_AUTH=false`
3. **Restart server**: Ctrl+C lalu `npm run dev`
4. **Login** dengan kredensial real
5. **Check logs** di terminal untuk debug

### **Jika Gagal:**

- Cek network/VPN
- Minta bantuan IT/Backend team
- Atau tetap pakai mock mode untuk development

---

**File ini disimpan di: `API_REAL_CONNECTION_GUIDE.md`**
