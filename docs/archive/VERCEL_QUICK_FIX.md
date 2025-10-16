# 🚀 Quick Fix: Error "Configuration" di Vercel

## ❌ Masalah

Login di Vercel menampilkan error: **"Configuration"**

## ✅ Solusi Cepat (5 Menit)

### Step 1: Generate Secret (30 detik)

Buka terminal, jalankan:

```bash
openssl rand -base64 32
```

**Copy hasilnya!** Contoh:

```
wJZx7Qz9Yp3Km8Fn2Lv5Td1Rh6Sg4Ac0Bw7Xe9Ui2Pj5Oa8=
```

---

### Step 2: Masuk ke Vercel (1 menit)

1. Buka: **https://vercel.com/dashboard**
2. Pilih project: **web-siadil**
3. Klik: **Settings** (tab atas)
4. Klik: **Environment Variables** (sidebar kiri)

---

### Step 3: Tambahkan Variables (3 menit)

#### Variable 1: NEXTAUTH_SECRET ⭐ **PALING PENTING!**

```
Click "Add New"

Name:    NEXTAUTH_SECRET
Value:   [paste secret dari step 1]

Environments:
☑ Production
☑ Preview
☑ Development

Click "Save"
```

#### Variable 2: NEXTAUTH_URL ⭐ **PENTING!**

```
Click "Add New"

Name:    NEXTAUTH_URL
Value:   https://web-siadil.vercel.app

Environments:
☑ Production
☑ Preview

Click "Save"
```

#### Variable 3: NEXT_PUBLIC_USE_MOCK_AUTH (Optional)

```
Click "Add New"

Name:    NEXT_PUBLIC_USE_MOCK_AUTH
Value:   true

Environments:
☑ Production
☑ Preview
☑ Development

Click "Save"
```

**Dengan value "true":** Login dengan mock data (admin/admin123)  
**Dengan value "false":** Login dengan SSO real (butuh VPN)

---

### Step 4: Redeploy (1 menit)

**Option A: Otomatis**

- Vercel akan auto-redeploy setelah save env vars
- Tunggu ~2 menit

**Option B: Manual (jika tidak auto)**

```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main-baru
```

---

### Step 5: Test Login ✅

Buka: **https://web-siadil.vercel.app/login**

**Jika pakai mock (NEXT_PUBLIC_USE_MOCK_AUTH=true):**

```
Username: admin
Password: admin123
```

**Jika pakai SSO real (NEXT_PUBLIC_USE_MOCK_AUTH=false):**

```
Username: [username SSO Anda]
Password: [password SSO Anda]
```

---

## 🎯 Expected Result

### ✅ SETELAH FIX:

```
1. Login form muncul normal
2. Input username & password
3. Klik "Masuk ke Sistem"
4. ✅ Redirect ke: /dashboard/siadil
5. ✅ Muncul: "Good Night, [Nama User]"
6. ✅ Foto profil muncul
```

### ❌ SEBELUM FIX:

```
1. Login form muncul
2. Klik "Masuk ke Sistem"
3. ❌ URL berubah ke: /login?error=Configuration
4. ❌ Error: "Configuration"
```

---

## 📋 Checklist Variables

Pastikan sudah set di Vercel:

- [ ] `NEXTAUTH_SECRET` - **WAJIB!** (secret yang di-generate)
- [ ] `NEXTAUTH_URL` - **WAJIB!** (https://web-siadil.vercel.app)
- [ ] `NEXT_PUBLIC_USE_MOCK_AUTH` - Optional (true untuk testing)

---

## 🆘 Masih Error?

### Problem 1: Masih muncul "Configuration"

**Solution:**

1. Double-check spelling: `NEXTAUTH_SECRET` (bukan `NEXT_AUTH_SECRET`)
2. Pastikan sudah save di Vercel
3. Tunggu 2-3 menit untuk redeploy
4. Hard refresh browser: `Ctrl + Shift + R`

### Problem 2: Login berhasil tapi redirect error

**Solution:**

1. Check `NEXTAUTH_URL` tidak ada trailing slash
2. ✅ Benar: `https://web-siadil.vercel.app`
3. ❌ Salah: `https://web-siadil.vercel.app/`

### Problem 3: "Cannot connect to server"

**Solution:**

1. Set `NEXT_PUBLIC_USE_MOCK_AUTH=true` di Vercel
2. Gunakan mock login: admin/admin123
3. Atau hubungkan ke VPN Pupuk Kujang untuk SSO real

---

## 💡 Tips

### For Development (Local):

File: `.env.local`

```bash
NEXTAUTH_SECRET=any-secret-for-local-dev
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

### For Production (Vercel):

Set di Vercel Dashboard:

```
NEXTAUTH_SECRET=[generated-strong-secret]
NEXTAUTH_URL=https://web-siadil.vercel.app
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

---

## 📸 Visual Guide

### Vercel Dashboard seharusnya terlihat seperti ini:

```
Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ NEXTAUTH_SECRET
   Value: •••••••••••••••••••••••••
   Production, Preview, Development

✅ NEXTAUTH_URL
   Value: https://web-siadil.vercel.app
   Production, Preview

✅ NEXT_PUBLIC_USE_MOCK_AUTH
   Value: true
   Production, Preview, Development
```

---

## 🎉 Done!

Setelah setup env vars dan redeploy:

- ✅ Login berfungsi normal
- ✅ Tidak ada error "Configuration"
- ✅ Session management berjalan
- ✅ Ready untuk production!

---

**Butuh Bantuan?**

- Cek file: `FIX_VERCEL_NEXTAUTH_CONFIG.md` (dokumentasi lengkap)
- Atau tanya via chat

**Total waktu setup: ~5 menit** ⏱️
