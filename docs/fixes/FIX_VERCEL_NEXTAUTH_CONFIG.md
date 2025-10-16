# Fix: NextAuth Configuration Error di Vercel

## 🚨 Error yang Terjadi

Ketika login di Vercel, muncul error:

```
Configuration
```

Di URL: `web-siadil.vercel.app/login?error=Configuration`

## 🔍 Root Cause

NextAuth.js **membutuhkan environment variables** yang tidak dikonfigurasi di Vercel:

1. ❌ `NEXTAUTH_SECRET` - **TIDAK ADA di Vercel**
2. ❌ `NEXTAUTH_URL` - **TIDAK ADA di Vercel**

Tanpa variables ini, NextAuth.js tidak bisa berfungsi di production.

---

## ✅ Solusi: Konfigurasi Environment Variables di Vercel

### Step 1: Generate NEXTAUTH_SECRET

Buka terminal dan jalankan:

```bash
# Generate random secret
openssl rand -base64 32
```

**Output example:**

```
wJZx7Qz9Yp3Km8Fn2Lv5Td1Rh6Sg4Ac0Bw7Xe9Ui2Pj5Oa8=
```

**Atau gunakan Node.js:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**SIMPAN SECRET INI!** Anda akan memasukkannya ke Vercel.

---

### Step 2: Konfigurasi di Vercel Dashboard

#### A. Masuk ke Vercel Project Settings

1. Buka: https://vercel.com/dashboard
2. Pilih project **web-siadil**
3. Klik tab **"Settings"**
4. Klik **"Environment Variables"** di sidebar kiri

#### B. Tambahkan Environment Variables

**Variable 1: NEXTAUTH_SECRET** (REQUIRED)

```
Name:  NEXTAUTH_SECRET
Value: wJZx7Qz9Yp3Km8Fn2Lv5Td1Rh6Sg4Ac0Bw7Xe9Ui2Pj5Oa8=
       (pakai secret yang Anda generate tadi)

Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 2: NEXTAUTH_URL** (REQUIRED)

```
Name:  NEXTAUTH_URL
Value: https://web-siadil.vercel.app

Environments: ✅ Production ✅ Preview
```

**Variable 3: NEXT_PUBLIC_API_URL** (Optional - untuk real API)

```
Name:  NEXT_PUBLIC_API_URL
Value: https://sso.pupuk-kujang.co.id

Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 4: NEXT_PUBLIC_USE_MOCK_AUTH** (Optional - untuk testing)

```
Name:  NEXT_PUBLIC_USE_MOCK_AUTH
Value: false   (atau "true" jika mau pakai mock data)

Environments: ✅ Production ✅ Preview ✅ Development
```

---

### Step 3: Screenshot Visual Guide

#### Cara Tambah Variable:

```
1. Click "Add New"
2. Enter name: NEXTAUTH_SECRET
3. Enter value: [your-generated-secret]
4. Select environments: Production, Preview, Development
5. Click "Save"
```

Ulangi untuk setiap variable.

---

### Step 4: Redeploy di Vercel

Setelah menambahkan environment variables:

**Option A: Auto Redeploy**

- Vercel akan otomatis trigger redeploy setelah environment variables ditambahkan

**Option B: Manual Redeploy**

```bash
# Di terminal
git commit --allow-empty -m "trigger redeploy"
git push origin main-baru
```

**Option C: Redeploy via Vercel Dashboard**

1. Go to "Deployments" tab
2. Find latest deployment
3. Click "..." → "Redeploy"

---

## 🔧 Update Local .env.local (Development)

Untuk testing lokal, pastikan file `.env.local` ada:

```bash
# .env.local

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=wJZx7Qz9Yp3Km8Fn2Lv5Td1Rh6Sg4Ac0Bw7Xe9Ui2Pj5Oa8=

# API Configuration
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Mock Auth (set to "true" for development without VPN)
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

⚠️ **JANGAN commit file `.env.local` ke git!**

---

## 📋 Environment Variables Checklist

### Production (Vercel):

| Variable                    | Value                          | Required    | Status       |
| --------------------------- | ------------------------------ | ----------- | ------------ |
| `NEXTAUTH_SECRET`           | [generated-secret]             | ✅ YES      | ❌ BELUM ADA |
| `NEXTAUTH_URL`              | https://web-siadil.vercel.app  | ✅ YES      | ❌ BELUM ADA |
| `NEXT_PUBLIC_API_URL`       | https://sso.pupuk-kujang.co.id | ⚠️ Optional | ❌ BELUM ADA |
| `NEXT_PUBLIC_USE_MOCK_AUTH` | false                          | ⚠️ Optional | ❌ BELUM ADA |

### Development (Local):

| Variable                    | Value                 | Required    | Status               |
| --------------------------- | --------------------- | ----------- | -------------------- |
| `NEXTAUTH_URL`              | http://localhost:3000 | ✅ YES      | ✅ Ada di .env.local |
| `NEXTAUTH_SECRET`           | [any-secret]          | ✅ YES      | ✅ Ada di .env.local |
| `NEXT_PUBLIC_USE_MOCK_AUTH` | true                  | ⚠️ Optional | ✅ Ada di .env.local |

---

## 🧪 Testing Setelah Fix

### 1. Test di Vercel (Production):

```
URL: https://web-siadil.vercel.app/login

Mode Mock (jika NEXT_PUBLIC_USE_MOCK_AUTH=true):
Username: admin
Password: admin123
→ Harus berhasil login

Mode Real API (jika NEXT_PUBLIC_USE_MOCK_AUTH=false):
Username: [your-sso-username]
Password: [your-sso-password]
→ Harus berhasil login (butuh VPN ke Pupuk Kujang)
```

### 2. Expected Result:

**SEBELUM (Error):**

```
❌ URL: /login?error=Configuration
❌ Message: "Configuration"
```

**SESUDAH (Success):**

```
✅ Redirect ke: /dashboard/siadil
✅ Session active
✅ User data loaded
```

---

## 🛡️ Security Best Practices

### ✅ DO:

1. **Generate unique secret** untuk production
2. **Store secrets di Vercel** environment variables
3. **Use different secrets** untuk dev vs production
4. **Rotate secrets periodically** (setiap 3-6 bulan)

### ❌ DON'T:

1. ❌ Commit `.env.local` ke git
2. ❌ Share secrets di chat/email
3. ❌ Gunakan fallback secret di production
4. ❌ Hardcode secrets di source code

---

## 🔄 Update auth.ts untuk Better Error Handling

Tambahkan validasi di `src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  // ... existing config

  secret: process.env.NEXTAUTH_SECRET, // ← REMOVE FALLBACK!

  // Add validation
  ...(process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET
    ? (() => {
        throw new Error(
          "NEXTAUTH_SECRET is required in production! Please set it in Vercel environment variables."
        );
      })()
    : {}),
};
```

Ini akan **FAIL FAST** jika secret tidak dikonfigurasi, lebih baik daripada runtime error.

---

## 📸 Visual Guide - Vercel Environment Variables

### Screenshot yang harus terlihat:

```
┌─────────────────────────────────────────────┐
│ Environment Variables                        │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ NEXTAUTH_SECRET             [Hidden]│   │
│ │ Production, Preview, Development    │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ NEXTAUTH_URL                        │   │
│ │ https://web-siadil.vercel.app       │   │
│ │ Production, Preview                 │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ NEXT_PUBLIC_API_URL                 │   │
│ │ https://sso.pupuk-kujang.co.id      │   │
│ │ Production, Preview, Development    │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ NEXT_PUBLIC_USE_MOCK_AUTH           │   │
│ │ false                               │   │
│ │ Production, Preview, Development    │   │
│ └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue 1: Masih error "Configuration" setelah set env vars

**Solution:**

```bash
# Redeploy manual
git commit --allow-empty -m "redeploy after env setup"
git push origin main-baru
```

### Issue 2: Login berhasil tapi redirect error

**Check:**

- NEXTAUTH_URL harus SAMA dengan domain Vercel
- Tidak ada trailing slash: ❌ `https://domain.com/` ✅ `https://domain.com`

### Issue 3: API SSO tidak bisa diakses

**Check:**

- `NEXT_PUBLIC_API_URL` sudah benar
- Vercel bisa akses ke SSO server (tidak butuh VPN di server side)
- Atau gunakan mock mode: `NEXT_PUBLIC_USE_MOCK_AUTH=true`

---

## 📝 Quick Commands

### Generate Secret:

```bash
openssl rand -base64 32
```

### Test Local:

```bash
npm run dev
# Login at http://localhost:3000/login
```

### Deploy:

```bash
git add .
git commit -m "docs: add vercel env vars guide"
git push origin main-baru
```

---

## 🎯 Summary

**Problem:** NextAuth Configuration Error di Vercel  
**Cause:** Missing NEXTAUTH_SECRET dan NEXTAUTH_URL  
**Solution:** Set environment variables di Vercel Dashboard

**Required Variables:**

1. ✅ `NEXTAUTH_SECRET` - Generate dengan openssl
2. ✅ `NEXTAUTH_URL` - URL production Vercel

**Optional Variables:** 3. ⚠️ `NEXT_PUBLIC_API_URL` - SSO API URL 4. ⚠️ `NEXT_PUBLIC_USE_MOCK_AUTH` - Mock mode toggle

---

## 🔗 Resources

- [NextAuth.js Deployment Docs](https://next-auth.js.org/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)

---

**Status:** ⚠️ **ACTION REQUIRED - Set environment variables di Vercel Dashboard!**
