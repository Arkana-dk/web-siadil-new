# Environment Variables untuk Vercel

## 🔧 Setup Environment Variables

Buka Vercel Dashboard → Settings → Environment Variables, lalu tambahkan:

---

## 1️⃣ NEXTAUTH_URL (WAJIB)

```
Name:  NEXTAUTH_URL
Value: https://websiadil.vercel.app
```

⚠️ **Ganti dengan domain Vercel Anda!**

Cara cek domain Vercel:

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Lihat di bagian "Domains" atau "Deployment URL"

---

## 2️⃣ NEXTAUTH_SECRET (WAJIB)

```
Name:  NEXTAUTH_SECRET
Value: [generate secret yang panjang dan acak]
```

### Cara Generate Secret:

**Option 1 - Terminal/CMD:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2 - OpenSSL:**

```bash
openssl rand -base64 64
```

**Option 3 - Online:**
https://generate-secret.vercel.app/32

Contoh hasil (JANGAN pakai ini, generate sendiri!):

```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
```

⚠️ **PENTING:**

- Secret harus minimal 32 karakter
- Jangan share ke siapapun
- Jangan commit ke Git
- Generate secret berbeda untuk dev & production

---

## 3️⃣ NEXT_PUBLIC_API_URL (Optional)

```
Name:  NEXT_PUBLIC_API_URL
Value: https://sso.pupuk-kujang.co.id
```

Digunakan untuk koneksi ke API SSO Demplon.

---

## 4️⃣ NEXT_PUBLIC_USE_MOCK_AUTH (Pilih Mode)

### Mode A: Mock Authentication (Recommended untuk Testing)

```
Name:  NEXT_PUBLIC_USE_MOCK_AUTH
Value: true
```

**Credentials untuk testing:**

```
Username: admin
Password: admin123

atau

Username: user
Password: user123
```

✅ **Keuntungan:**

- Tidak perlu VPN
- Tidak perlu koneksi ke server internal
- Bisa test kapan saja
- Cocok untuk demo

❌ **Kekurangan:**

- Data tidak real
- Hanya untuk development/testing

---

### Mode B: Real API Authentication

```
Name:  NEXT_PUBLIC_USE_MOCK_AUTH
Value: false
```

**Credentials:** Gunakan username & password SSO Demplon Anda

✅ **Keuntungan:**

- Data real dari server
- Autentikasi sesungguhnya
- Cocok untuk production

❌ **Kekurangan:**

- ⚠️ **Harus pakai VPN** atau jaringan internal
- Vercel tidak bisa akses server internal
- Error jika server tidak bisa diakses

---

## 📋 Summary Environment Variables

Copy-paste ini ke Vercel (ganti value-nya):

```bash
# WAJIB - NextAuth Configuration
NEXTAUTH_URL=https://websiadil.vercel.app
NEXTAUTH_SECRET=[generate-secret-panjang-di-sini]

# Optional - API Configuration
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Mode: true = mock, false = real API
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

---

## ⚙️ Setting di Vercel Dashboard

Untuk setiap environment variable:

1. Klik **"Add New"**
2. Isi **Name** dan **Value**
3. **Environment:** Centang ketiga opsi:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
4. Klik **"Save"**

---

## 🔄 Setelah Set Environment Variables

**WAJIB Redeploy:**

1. Pergi ke tab **"Deployments"**
2. Pilih deployment terakhir
3. Klik **"⋮"** (three dots) → **"Redeploy"**
4. Pilih **"Use existing Build Cache"**
5. Tunggu sampai status **"Ready"**

Atau push commit baru ke Git:

```bash
git add .
git commit -m "update env config"
git push
```

---

## 🧪 Test Environment Variables

Setelah deployment selesai, test apakah environment variables sudah ke-load:

**Cara 1 - Check di Browser Console:**

1. Buka website Vercel Anda
2. Klik F12 → Console
3. Ketik: `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Harusnya muncul URL API

**Cara 2 - Test Login:**

1. Buka `/login`
2. Coba login dengan credentials
3. Jika berhasil = Environment variables sudah benar ✅
4. Jika error "Configuration" = Environment variables belum di-set ❌

---

## 🐛 Troubleshooting

### Error "Configuration" masih muncul?

**Checklist:**

- [ ] NEXTAUTH_URL sudah di-set? (cek di Settings → Environment Variables)
- [ ] NEXTAUTH_SECRET sudah di-set?
- [ ] Sudah centang Production, Preview, Development?
- [ ] Sudah redeploy setelah set environment variables?
- [ ] Deployment sudah status "Ready" (bukan "Building")?

### Cara memastikan environment variables sudah ter-apply:

1. Buka Vercel Dashboard
2. Pergi ke Deployments → Pilih deployment terbaru
3. Klik tab **"Environment Variables"**
4. Lihat apakah variables sudah muncul di sana

### NEXTAUTH_SECRET tidak ke-detect?

Kemungkinan:

- Secret terlalu pendek (minimal 32 karakter)
- Ada spasi di awal/akhir secret
- Belum redeploy setelah set variable

**Fix:**

1. Generate secret baru yang lebih panjang (64+ karakter)
2. Copy-paste dengan hati-hati (jangan ada spasi)
3. Save → Redeploy

---

## 🔒 Security Best Practices

### DO ✅

- Generate secret yang panjang (64+ karakter)
- Simpan secret di password manager (1Password, LastPass, dll)
- Gunakan secret berbeda untuk development & production
- Rotate secret secara berkala (6 bulan sekali)

### DON'T ❌

- Jangan share secret ke siapapun
- Jangan commit secret ke Git/GitHub
- Jangan pakai secret yang mudah ditebak
- Jangan screenshot secret dan share

---

## 📞 Butuh Bantuan?

Jika masih error setelah ikuti semua langkah:

1. **Check Vercel Logs:**

   - Dashboard → Deployment → Runtime Logs
   - Cari error message

2. **Check Browser Console:**

   - F12 → Console tab
   - Lihat ada error apa

3. **Clear Cache:**

   - Ctrl + Shift + Delete
   - Clear cookies & cache
   - Refresh halaman

4. **Try Incognito Mode:**
   - Chrome: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P

---

**Last Updated:** 8 Oktober 2025  
**Status:** ✅ Ready to Deploy
