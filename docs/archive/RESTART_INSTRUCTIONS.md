# 🔄 Instruksi Restart Server

## Masalah yang Terjadi

Saat mencoba login dengan API real, mendapat error:

```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Penyebab

Error ini terjadi karena **URL API sebelumnya salah** - mengarah ke halaman HTML bukan endpoint JSON API.

## ✅ Solusi yang Sudah Dilakukan

URL API sudah diperbaiki di `.env.local`:

```bash
# ❌ SALAH (sebelumnya):
NEXT_PUBLIC_API_URL=https://demplon.pupuk-kujang.co.id/web/siadil/api/login

# ✅ BENAR (sekarang):
NEXT_PUBLIC_API_URL=https://demplon.pupuk-kujang.co.id/web/siadil/api
```

**Mengapa ini penting:**

- Code di `src/lib/auth.ts` akan otomatis menambahkan `/auth/login`
- Jadi request lengkapnya akan menjadi: `.../api/auth/login` ✅

---

## 🚀 Langkah Selanjutnya

### 1. **Restart Development Server**

Di terminal VSCode Anda yang sedang menjalankan `npm run dev`:

```bash
# Tekan Ctrl+C untuk stop server
# Lalu jalankan lagi:
npm run dev
```

**Atau gunakan shortcut:**

- Tekan `Ctrl+C` di terminal
- Tunggu beberapa detik
- Ketik `npm run dev` lalu Enter

### 2. **Test Login Lagi**

Buka browser dan akses:

```
http://localhost:3000/login
```

Coba login dengan credentials yang valid.

---

## 📊 Kemungkinan Hasil

### ✅ **Hasil 1: Berhasil Login**

Jika Anda di jaringan internal PT Pupuk Kujang atau sudah connect VPN, dan credentials benar:

- Login akan berhasil
- Redirect ke `/dashboard/siadil`
- Session tersimpan

### ⚠️ **Hasil 2: Error "Tidak dapat terhubung ke server"**

```
Tidak dapat terhubung ke server. Pastikan Anda terhubung ke jaringan internal.
```

**Artinya:**

- URL API sudah benar ✅
- Tapi **tidak ada akses network** ke server Demplon
- Anda perlu:
  - Connect ke VPN kantor, ATAU
  - Gunakan jaringan internal kantor

### ❌ **Hasil 3: Error "Username atau password salah"**

**Artinya:**

- URL API sudah benar ✅
- Network connection OK ✅
- Tapi credentials yang digunakan tidak valid
- Gunakan credentials yang benar dari tim backend

### 🔴 **Hasil 4: Masih Error JSON Parse**

Jika masih mendapat error yang sama, kemungkinan:

- Server belum di-restart (ulangi langkah 1)
- Endpoint API berbeda dari yang kita kira
- Perlu konfirmasi dengan tim backend tentang endpoint yang benar

---

## 🔍 Cara Test Koneksi Network

### Test 1: Ping Server

```bash
ping demplon.pupuk-kujang.co.id
```

**Hasil yang diharapkan:**

```
Reply from x.x.x.x: bytes=32 time=<10ms TTL=64
```

**Jika gagal:**

```
Request timed out
```

→ Artinya tidak ada akses network, perlu VPN atau jaringan internal

### Test 2: Curl API Endpoint (Optional)

```bash
curl -X POST https://demplon.pupuk-kujang.co.id/web/siadil/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

**Jika berhasil connect:**

- Akan dapat response JSON (valid atau error message)

**Jika gagal connect:**

- Timeout atau connection refused

---

## 🔄 Jika Masih Butuh Development Mode

Jika Anda masih perlu development tanpa API real, ubah kembali di `.env.local`:

```bash
# Kembali ke mock mode
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

Lalu restart server.

**Mock credentials yang bisa dipakai:**

- Username: `admin` / Password: `admin123`
- Username: `user` / Password: `user123`

---

## 📝 Checklist

- [ ] Stop server dengan `Ctrl+C`
- [ ] Jalankan `npm run dev` lagi
- [ ] Tunggu sampai "Ready" muncul di terminal
- [ ] Buka browser: `http://localhost:3000/login`
- [ ] Test login dengan credentials valid
- [ ] Catat hasil error (jika ada) untuk troubleshooting lebih lanjut

---

## 🆘 Troubleshooting Tambahan

### Cache Browser

Jika masih ada masalah, clear cache browser:

- Chrome: `Ctrl+Shift+Delete` → Clear browsing data
- Atau buka Incognito/Private window

### Hard Refresh

- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### Check Console Browser

Buka Developer Tools (F12) → Tab Console
Lihat error messages untuk informasi lebih detail

---

## 📞 Hubungi Tim Backend Jika:

1. Masih mendapat JSON parse error setelah restart
2. Tidak yakin endpoint API yang benar
3. Butuh konfirmasi format request/response API
4. Butuh credentials testing yang valid
5. Perlu info tentang CORS atau security settings

---

## 🎯 Summary

**Masalah:** URL API salah (include /login)
**Solusi:** Sudah diperbaiki (base URL saja)
**Action:** **Restart server** → Test login lagi
**Expected:** Bisa connect ke API (mungkin butuh VPN/network internal)

**Good luck! 🚀**
