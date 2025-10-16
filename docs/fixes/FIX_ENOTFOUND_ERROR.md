# 🚨 Quick Fix: ENOTFOUND Error

## ❌ Error Yang Muncul

```
[Error: getaddrinfo ENOTFOUND sso.pupuk-kujang.co.id]
errno: -3008,
code: 'ENOTFOUND',
hostname: 'sso.pupuk-kujang.co.id'
```

---

## 🎯 Penyebab

**ENOTFOUND** = Domain tidak ditemukan (DNS lookup failed)

Artinya:

- ❌ Domain `sso.pupuk-kujang.co.id` **tidak ada** atau tidak bisa diakses
- ❌ File `.env.local` masih pakai URL lama yang salah

---

## ✅ Solusi (Sudah Diperbaiki!)

### File: `.env.local`

**Sebelum (SALAH):**

```bash
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id
                              ↑↑↑
                           Domain ini tidak ada!
```

**Sekarang (BENAR):**

```bash
NEXT_PUBLIC_API_URL=https://demplon.pupuk-kujang.co.id/web/siadil/api
                              ↑↑↑↑↑↑
                           Domain yang benar (sudah di-test ping ✅)
```

---

## 🔄 Action Required

### **WAJIB: Restart Development Server**

Server perlu di-restart untuk load environment variables yang baru:

```bash
# Di terminal yang running npm run dev:
Ctrl+C        # Stop server
npm run dev   # Start lagi
```

**TUNGGU sampai muncul:**

```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## 🧪 Test Lagi

### 1. Buka Browser

```
http://localhost:3000/login
```

### 2. Buka Console (F12)

- Tab: **Console**
- Lihat log message:
  ```
  🔌 Attempting API login to: https://demplon.pupuk-kujang.co.id/web/siadil/api
  ```
  Pastikan URL-nya sudah **demplon**, bukan **sso**!

### 3. Input Credentials

- Username & password yang valid
- Click Login

### 4. Check Result

- ✅ Success → Redirect ke dashboard
- ❌ Error credentials → Username/password salah (tapi API sudah connect!)
- ❌ Error JSON parse → Endpoint path mungkin salah
- ❌ Error ENOTFOUND lagi → **Server belum di-restart!**

---

## 📊 Verification Test

### Test 1: Ping Domain (Optional)

```bash
ping demplon.pupuk-kujang.co.id
```

**Expected:**

```
✅ Reply from 34.160.213.193: bytes=32 time=4ms
```

### Test 2: Check Console Log

Saat login, di console browser harus muncul:

```
🔌 Attempting API login to: https://demplon.pupuk-kujang.co.id/web/siadil/api
```

Kalau masih muncul:

```
❌ Attempting API login to: https://sso.pupuk-kujang.co.id
```

→ **Server belum di-restart!**

---

## 🐛 Jika Masih Error ENOTFOUND

### Checklist:

- [ ] Sudah edit `.env.local` dengan URL yang benar?
- [ ] Sudah **save** file `.env.local`? (Ctrl+S)
- [ ] Sudah **restart server**? (Ctrl+C → npm run dev)
- [ ] Sudah **tunggu** sampai "Ready" muncul?
- [ ] Sudah **refresh browser**? (Ctrl+Shift+R)

### Jika masih gagal:

```bash
# Hard restart:
Ctrl+C                    # Stop server
rm -rf .next              # Clear Next.js cache
npm run dev               # Start lagi
```

---

## 📝 Summary

| Item             | Status                                              |
| ---------------- | --------------------------------------------------- |
| **Masalah**      | Domain `sso.pupuk-kujang.co.id` tidak ada           |
| **Code**         | ✅ Tidak ada masalah                                |
| **`.env.local`** | ✅ Sudah diperbaiki ke `demplon.pupuk-kujang.co.id` |
| **Action**       | ⚠️ **Restart server SEKARANG!**                     |

---

## 🎯 Final URL

Request akan dikirim ke:

```
https://demplon.pupuk-kujang.co.id/web/siadil/api/auth/login ✅
```

Breakdown:

- Base: `https://demplon.pupuk-kujang.co.id/web/siadil/api`
- Endpoint: `/auth/login`
- Method: `POST`
- Body: `{username: "...", password: "..."}`

---

## 🚀 Next Steps

1. **Save file `.env.local`** (jika belum)
2. **Restart server** (Ctrl+C → npm run dev)
3. **Wait for "Ready"**
4. **Test login** di browser
5. **Check console** untuk debugging

---

**Good luck! 🎉**

Jika masih ada error ENOTFOUND setelah restart, berarti ada yang belum ke-save atau server belum di-restart dengan benar.
