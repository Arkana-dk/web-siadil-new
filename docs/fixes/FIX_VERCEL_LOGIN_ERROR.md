# 🔧 Fix: Error Configuration di Vercel Login

## 🚨 Masalah

Ketika deploy ke Vercel, muncul error **"Configuration"** saat login, padahal di localhost berfungsi normal.

**URL yang bermasalah:**

```
websiadil.vercel.app/login?error=Configuration
```

---

## 🔍 Penyebab Error

### 1. **Environment Variables Tidak Di-Set di Vercel**

- File `.env.local` hanya ada di komputer lokal
- Vercel tidak bisa akses file ini
- NextAuth butuh `NEXTAUTH_URL` dan `NEXTAUTH_SECRET`

### 2. **NEXTAUTH_URL Salah**

- Di lokal: `http://localhost:3000` ✅
- Di Vercel: Harus pakai URL domain Vercel ❌

### 3. **NEXTAUTH_SECRET Tidak Ada**

- NextAuth wajib butuh secret untuk encrypt session
- Tanpa secret → Error Configuration

---

## ✅ Solusi Lengkap

### **LANGKAH 1: Generate NEXTAUTH_SECRET**

Buka terminal/command prompt dan jalankan salah satu:

**Cara 1 - Pakai Node.js:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Cara 2 - Pakai OpenSSL:**

```bash
openssl rand -base64 64
```

**Cara 3 - Online Generator:**
Kunjungi: https://generate-secret.vercel.app/32

Copy hasil outputnya, contoh:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

### **LANGKAH 2: Set Environment Variables di Vercel**

1. **Login ke Vercel Dashboard**

   - Buka: https://vercel.com/dashboard
   - Pilih project: `web-siadil` (atau nama project Anda)

2. **Masuk ke Settings**

   - Klik tab **"Settings"** di menu atas
   - Pilih **"Environment Variables"** di sidebar kiri

3. **Tambahkan Environment Variables**

Klik **"Add New"** dan masukkan satu per satu:

#### **A. NEXTAUTH_URL** (WAJIB)

```
Name:  NEXTAUTH_URL
Value: https://websiadil.vercel.app
Environment: Production, Preview, Development (centang semua)
```

⚠️ **PENTING:** Ganti `websiadil.vercel.app` dengan domain Vercel Anda yang sebenarnya!

#### **B. NEXTAUTH_SECRET** (WAJIB)

```
Name:  NEXTAUTH_SECRET
Value: [paste secret yang sudah di-generate dari Langkah 1]
Environment: Production, Preview, Development (centang semua)
```

#### **C. NEXT_PUBLIC_API_URL** (Optional - untuk API real)

```
Name:  NEXT_PUBLIC_API_URL
Value: https://sso.pupuk-kujang.co.id
Environment: Production, Preview, Development (centang semua)
```

#### **D. NEXT_PUBLIC_USE_MOCK_AUTH** (Pilih Mode)

```
Name:  NEXT_PUBLIC_USE_MOCK_AUTH
Value: true    (untuk testing dengan mock data)
# atau
Value: false   (untuk pakai API real - butuh VPN)
Environment: Production, Preview, Development (centang semua)
```

---

### **LANGKAH 3: Redeploy ke Vercel**

Setelah environment variables di-set, Vercel harus redeploy:

**Cara 1 - Auto Redeploy (Recommended):**

1. Klik tab **"Deployments"**
2. Pilih deployment terakhir
3. Klik tombol **"Redeploy"**
4. Pilih **"Use existing Build Cache"** (lebih cepat)

**Cara 2 - Git Push (Manual):**

```bash
git add .
git commit -m "fix: add environment variables"
git push origin main-baru
```

---

### **LANGKAH 4: Test Login**

Setelah deployment selesai:

1. Buka: https://websiadil.vercel.app/login
2. Test dengan credentials:

**Mode Mock (NEXT_PUBLIC_USE_MOCK_AUTH=true):**

```
Username: admin
Password: admin123

atau

Username: user
Password: user123
```

**Mode Real API (NEXT_PUBLIC_USE_MOCK_AUTH=false):**

- Gunakan username & password SSO Demplon Anda
- **PENTING:** Harus pakai VPN/jaringan internal kantor!

---

## 🎯 Checklist Verifikasi

Pastikan sudah melakukan semua ini:

- [ ] Generate NEXTAUTH_SECRET yang baru
- [ ] Set NEXTAUTH_URL dengan domain Vercel yang benar
- [ ] Set NEXTAUTH_SECRET di Vercel
- [ ] Set NEXT_PUBLIC_USE_MOCK_AUTH (true/false)
- [ ] Centang semua environment (Production, Preview, Development)
- [ ] Redeploy project di Vercel
- [ ] Test login setelah deployment selesai

---

## 🔒 Tips Keamanan

### ⚠️ JANGAN:

- ❌ Share NEXTAUTH_SECRET ke siapapun
- ❌ Commit NEXTAUTH_SECRET ke Git
- ❌ Pakai secret yang sama untuk development & production
- ❌ Pakai secret yang pendek atau sederhana

### ✅ LAKUKAN:

- ✅ Generate secret baru untuk setiap environment
- ✅ Simpan secret di password manager
- ✅ Gunakan secret minimal 64 karakter
- ✅ Rotate secret secara berkala (setiap 3-6 bulan)

---

## 🐛 Troubleshooting

### **Error masih muncul setelah set environment variables?**

1. **Cek apakah deployment sudah selesai:**

   - Buka Vercel Dashboard → Deployments
   - Status harus **"Ready"** bukan "Building"

2. **Cek environment variables sudah benar:**

   - Settings → Environment Variables
   - Pastikan NEXTAUTH_URL dan NEXTAUTH_SECRET ada
   - Pastikan centang semua environment

3. **Clear browser cache:**

   ```
   Ctrl + Shift + Delete
   Pilih: Cookies dan Cache
   ```

4. **Coba buka di Incognito/Private Mode:**

   - Chrome: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P

5. **Cek Vercel Logs:**
   - Dashboard → Deployment → Runtime Logs
   - Lihat apakah ada error lain

### **Login berhasil di localhost tapi gagal di Vercel?**

Kemungkinan mode auth berbeda:

**Localhost:**

- `.env.local`: `NEXT_PUBLIC_USE_MOCK_AUTH=false` (API real)
- Bisa akses jaringan internal

**Vercel:**

- Environment Variables: `NEXT_PUBLIC_USE_MOCK_AUTH=false`
- **TIDAK bisa akses jaringan internal** (butuh public API atau mock)

**Solusi:** Set `NEXT_PUBLIC_USE_MOCK_AUTH=true` di Vercel untuk testing.

### **Cara check environment variables sudah ke-load?**

Tambahkan di file `src/app/api/test-env/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not Set",
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK_AUTH,
  });
}
```

Lalu buka: `https://websiadil.vercel.app/api/test-env`

---

## 📚 Referensi

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## ✅ Status

**Problem:** Error "Configuration" saat login di Vercel
**Root Cause:** Environment variables tidak di-set di Vercel
**Solution:** Set NEXTAUTH_URL dan NEXTAUTH_SECRET di Vercel Dashboard
**Status:** ✅ **RESOLVED**

---

**Last Updated:** 8 Oktober 2025  
**Author:** GitHub Copilot  
**Project:** SIADIL - Sistem Arsip Digital
