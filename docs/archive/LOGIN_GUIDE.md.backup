# 🔐 Panduan Login SIADIL

## 🎯 Cara Login

### Mode Development (Mock Authentication)

Saat ini sistem menggunakan **Mock Authentication** untuk testing tanpa perlu API real.

#### Langkah-langkah:

1. **Buka browser** → `http://localhost:3002/login` (atau port yang ditampilkan di terminal)

2. **Gunakan credentials berikut:**

   **Admin Account:**

   - Username: `admin`
   - Password: `admin123`
   - Roles: admin, user
   - Organization: IT Department

   **User Account:**

   - Username: `user`
   - Password: `user123`
   - Roles: user
   - Organization: General Department

3. **Klik tombol "Masuk"**

4. **Anda akan redirect ke dashboard** `/dashboard`

---

## 🔄 Switching Modes

### Development Mode (Mock) → Production Mode (Real API)

Edit file `.env.local`:

```env
# Development Mode (Gunakan Mock Data)
NEXT_PUBLIC_USE_MOCK_AUTH=true

# Production Mode (Gunakan API Real)
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

**Setelah ubah, WAJIB restart server:**

```bash
# Stop server (Ctrl+C di terminal)
# Start lagi:
npm run dev
```

---

## ❌ Troubleshooting

### Error: "fetch failed"

**Penyebab:**

- API endpoint tidak bisa diakses
- Tidak terhubung ke VPN/network internal
- API URL salah

**Solusi:**

**1. Gunakan Mock Mode untuk testing:**

```env
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

**2. Untuk akses API real:**

- Pastikan terhubung ke VPN perusahaan
- Cek koneksi internet
- Verifikasi API URL benar
- Test API dengan cURL/Postman terlebih dahulu

### Error: "Username atau password salah"

**Mode Development:**

- Gunakan credentials demo di atas
- Perhatikan huruf besar/kecil (case-sensitive)

**Mode Production:**

- Gunakan credentials Demplon Anda
- Pastikan akun Anda memiliki akses ke aplikasi SIADIL

### Error: Network/CORS

**Jika muncul CORS error:**

1. Backend harus whitelist domain Anda
2. Hubungi team backend
3. Gunakan mock mode untuk development

---

## 🔍 Cek Mode Saat Ini

**Di halaman login**, perhatikan info box:

- Jika ada "🔧 Mode Development (Mock Auth)" → Mock mode aktif
- Jika ada "Masukkan username dan password..." → Production mode aktif

**Di terminal**, cari log:

```
🔧 [DEV MODE] Using mock authentication  ← Mock mode
🔌 Attempting API login to: https://...  ← Production mode
```

---

## 📊 After Login

Setelah login berhasil, Anda akan melihat:

✅ **Sidebar Profile Section:**

- Foto profil (atau inisial)
- Nama lengkap
- Username
- Organization name

✅ **Session Data:**

```javascript
session.user {
  id: "1"
  username: "admin"
  name: "Administrator"
  email: "admin@example.com"
  roles: ["admin", "user"]
  organization: { ... }
  application: { ... }
}
```

✅ **Protected Routes:**

- Dashboard accessible
- All sub-pages accessible
- Automatic redirect if not logged in

---

## 🚪 Logout

1. **Hover** pada profile di sidebar
2. **Klik** icon logout (merah)
3. Akan redirect ke `/login`
4. Session dihapus

---

## 📝 Testing Checklist

- [ ] Login dengan admin → Success
- [ ] Login dengan user → Success
- [ ] Login dengan credentials salah → Error message muncul
- [ ] Akses `/dashboard` tanpa login → Redirect ke `/login`
- [ ] Logout → Redirect ke `/login`
- [ ] Login lagi → Dashboard accessible
- [ ] Profile data tampil di sidebar
- [ ] Session persist setelah refresh

---

## 🔧 Configuration Files

### `.env.local`

```env
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
NEXT_PUBLIC_USE_MOCK_AUTH=true  # Change to false for production
```

### Mock Users (in `src/lib/auth.ts`)

```typescript
// Admin
username: "admin";
password: "admin123";
roles: ["admin", "user"];

// User
username: "user";
password: "user123";
roles: ["user"];
```

---

## 🎯 Production Deployment

Saat deploy ke production:

1. **Set environment variables di platform hosting:**

   ```env
   NEXT_PUBLIC_USE_MOCK_AUTH=false
   NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
   NEXTAUTH_SECRET=<generate-new-random-string>
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **JANGAN commit `.env.local`** (sudah di `.gitignore`)

3. **Test API connectivity** dari server production

4. **Monitor logs** untuk error

---

## 📞 Need Help?

**Jika masih ada masalah:**

1. Cek terminal untuk error logs
2. Buka Browser Console (F12) untuk error
3. Baca dokumentasi lengkap di `API_INTEGRATION.md`
4. Hubungi team IT/Backend jika masalah API

---

**Version:** 1.0.0
**Last Updated:** October 2025
**Status:** ✅ Ready for Development Testing
