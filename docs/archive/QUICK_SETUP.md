# 🚀 Quick Setup Guide - API Integration

## ✅ Yang Sudah Dikonfigurasi

### 1. NextAuth.js Setup

- ✅ `src/lib/auth.ts` - Konfigurasi dengan API call
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - API routes
- ✅ `src/types/next-auth.d.ts` - TypeScript types untuk session

### 2. Components

- ✅ `src/app/login/page.tsx` - Halaman login
- ✅ `src/components/ProfileSection.tsx` - Profile dengan foto dari API
- ✅ `src/components/Providers.tsx` - SessionProvider wrapper
- ✅ `src/middleware.ts` - Route protection

### 3. Configuration Files

- ✅ `.env.local` - Environment variables

## ⚙️ Setup Steps

### 1. Pastikan Dependencies Terinstall

```bash
npm install
```

### 2. Cek File .env.local

File `.env.local` harus berisi:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

⚠️ **Sesuaikan `NEXT_PUBLIC_API_URL` dengan endpoint API Anda!**

### 3. Restart Development Server

Setelah ubah `.env.local`, WAJIB restart server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 4. Test Login

1. Buka browser: `http://localhost:3001/login`
2. Masukkan username & password Anda
3. Klik "Masuk"

## 🔍 Endpoint API yang Digunakan

```
POST {NEXT_PUBLIC_API_URL}/auth/login
```

Contoh lengkap:

```
POST https://api.pupuk-kujang.co.id/demplon/auth/login
Content-Type: application/json

Body:
{
  "username": "3082625",
  "password": "your-password"
}
```

## 📊 Flow Diagram

```
User Input (username, password)
        ↓
Login Page (src/app/login/page.tsx)
        ↓
NextAuth signIn()
        ↓
Auth Config (src/lib/auth.ts)
        ↓
API Call → POST /auth/login
        ↓
API Response (success/error)
        ↓
[Success] → Create Session (JWT)
        ↓
Redirect to /dashboard
        ↓
Profile Section shows user data + photo
```

## 🎯 Features Implemented

### Login Page

- ✅ Modern UI with gradient
- ✅ Show/hide password
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

### Session Management

- ✅ JWT-based session
- ✅ 30 days expiry
- ✅ Auto-refresh
- ✅ Secure httpOnly cookies

### Profile Section

- ✅ User photo from API
- ✅ Name & username
- ✅ Organization name
- ✅ Logout button on hover
- ✅ Fallback to initials if no photo

### Protected Routes

- ✅ Middleware protection
- ✅ Auto-redirect to /login
- ✅ Session check on every request

## 📦 Session Data Available

```typescript
session.user {
  id: string
  username: string
  name: string
  email: string
  pic: string // URL foto profil
  roles: string[] // Array of roles
  organization: {
    id: string
    name: string
    leader: boolean
  }
  application: {
    id: number
    slug: string
    name: string
    description: string
    active: boolean
  }
}
```

## 🔧 Common Issues & Solutions

### Issue 1: API CORS Error

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**

- API backend harus allow domain Anda
- Hubungi backend team untuk whitelist
- Untuk dev: mungkin perlu setup proxy

### Issue 2: Environment Variables Tidak Terbaca

**Error:** API call ke URL yang salah

**Solution:**

```bash
# Stop server
Ctrl+C

# Restart server
npm run dev
```

### Issue 3: Session Tidak Tersimpan

**Error:** Login berhasil tapi redirect kembali ke login

**Solution:**

1. Clear browser cookies
2. Cek `NEXTAUTH_SECRET` di `.env.local`
3. Pastikan `Providers` wrapper ada di `layout.tsx`

### Issue 4: Foto Profil Tidak Muncul

**Error:** Foto tidak load atau broken image

**Solution:**

- URL foto harus HTTPS dan accessible
- Cek CORS di image server
- Fallback otomatis ke inisial jika gagal

## 📝 Testing Checklist

- [ ] Login dengan credentials valid → Success
- [ ] Login dengan credentials invalid → Error message muncul
- [ ] Profile photo muncul di sidebar
- [ ] Organization name muncul di profile
- [ ] Logout button berfungsi
- [ ] Protected routes redirect ke /login jika belum login
- [ ] Session persist setelah refresh page
- [ ] Error message jelas dan informatif

## 🐛 Debug Mode

Untuk melihat detail log, buka terminal yang menjalankan `npm run dev`.

Debug mode sudah diaktifkan untuk development:

```typescript
debug: process.env.NODE_ENV === "development";
```

Anda akan melihat log seperti:

```
[next-auth][debug] adapter
[next-auth][debug] session
[next-auth][debug] jwt
```

## 📚 Documentation Files

1. **AUTH_README.md** - Dokumentasi lengkap sistem autentikasi
2. **API_INTEGRATION.md** - Detail integrasi dengan API
3. **API_TEST.md** - Cara test API dengan cURL & browser
4. **QUICK_SETUP.md** - File ini (quick setup guide)

## 🎉 Next Steps

Setelah login berhasil:

1. **Test Semua Fitur**

   - Test login/logout
   - Test protected routes
   - Test session persistence

2. **Customize UI** (Optional)

   - Sesuaikan warna/theme di login page
   - Tambah logo/branding
   - Customize error messages

3. **Add Role-Based Access** (Optional)

   - Edit `middleware.ts`
   - Tambah logic untuk cek roles
   - Restrict routes berdasarkan role

4. **Production Deployment**
   - Ganti `NEXTAUTH_SECRET` dengan random string
   - Set production `NEXTAUTH_URL`
   - Enable HTTPS
   - Set secure cookie flags

## 💡 Tips

1. **Development**: Gunakan debug mode untuk troubleshoot
2. **Production**: Disable debug mode untuk security
3. **Testing**: Test dengan multiple user roles
4. **Security**: Never commit `.env.local` to Git
5. **Performance**: API response < 2 detik ideal

## 🆘 Need Help?

1. Check console logs (Browser F12)
2. Check terminal logs (npm run dev)
3. Check API response di Network tab
4. Baca dokumentasi lengkap di `API_INTEGRATION.md`

---

**Status:** ✅ Ready to Test

**Last Updated:** $(date)

**Version:** 1.0.0
