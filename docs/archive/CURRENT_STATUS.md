# ✅ STATUS AUTHENTICATION - Web SIADIL

## 📊 Current Status

```
╔════════════════════════════════════════════════════════════╗
║  🔧 MODE: DEVELOPMENT (Mock Authentication)               ║
║  📦 Status: Menggunakan Data Dummy                        ║
║  🌐 API Real: TIDAK AKTIF                                 ║
╚════════════════════════════════════════════════════════════╝
```

### Configuration:

```env
NEXT_PUBLIC_USE_MOCK_AUTH=true  ← MODE SAAT INI
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

---

## ❓ Apakah Menggunakan Endpoint Pak Tono?

### ❌ **TIDAK** (Saat Ini)

**Bukti:**

1. `.env.local` set ke `USE_MOCK_AUTH=true`
2. Sistem menggunakan data dummy
3. Login pakai: admin/admin123 atau user/user123
4. Nama yang muncul: "Administrator" atau "User Demo"
5. Tidak ada network request ke API real

**Jika pakai API Pak Tono, seharusnya:**

- Login pakai NIP: `3082625`
- Password: Password asli dari sistem
- Nama yang muncul: "Tono Sartono"
- Ada foto dari: `https://statics.pupuk-kujang.co.id/demplon/picemp/3082625.jpg`
- Ada network request ke API

---

## 🔄 Cara Aktifkan API Real (Endpoint Pak Tono)

### Step-by-Step:

#### 1️⃣ Edit `.env.local`

```bash
# Buka file: .env.local
# Ubah baris ini:

# DARI:
NEXT_PUBLIC_USE_MOCK_AUTH=true

# JADI:
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

#### 2️⃣ Restart Server

```bash
# Di terminal, tekan Ctrl+C
# Lalu jalankan lagi:
npm run dev
```

#### 3️⃣ Test Login

```
URL: http://localhost:3002/login
Username: 3082625 (atau NIP Anda)
Password: Password asli Anda
```

#### 4️⃣ Verifikasi

**Buka Browser Console (F12)**

Seharusnya muncul:

```
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
```

---

## 🧪 Cara Cek Apakah API Sudah Aktif

### Method 1: Cek Console Browser

**Mock Mode (Sekarang):**

```javascript
🔧 [DEV MODE] Using mock authentication
```

**Real API Mode (Target):**

```javascript
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
```

### Method 2: Cek Terminal Server

Lihat output saat login:

**Mock Mode:**

```
POST /api/auth/callback/credentials 200 in 38ms  ← Sangat cepat
```

**Real API Mode:**

```
🔌 Attempting API login to: https://api.pupuk-kujang.co.id/demplon
POST /api/auth/callback/credentials 200 in 1500ms  ← Lebih lama (network)
```

### Method 3: Cek Data yang Muncul

**Mock Mode:**
| Field | Value |
|-------|-------|
| Name | Administrator / User Demo |
| Username | admin / user |
| Organization | IT Department / General Department |
| Photo | Tidak ada (pakai inisial) |

**Real API Mode:**
| Field | Value |
|-------|-------|
| Name | Tono Sartono (dari API) |
| Username | 3082625 (NIP) |
| Organization | Departemen Mitra Bisnis Layanan TI PKC |
| Photo | URL dari API |

### Method 4: Cek Network Tab

**Buka Browser DevTools (F12) → Tab Network**

**Mock Mode:**

- Tidak ada request ke `api.pupuk-kujang.co.id`
- Hanya ada request local

**Real API Mode:**

- Ada request ke `https://api.pupuk-kujang.co.id/demplon/auth/login`
- Status: 200 (success) atau 401 (unauthorized)

---

## 📝 Quick Commands

### Cek current mode:

```bash
grep "USE_MOCK_AUTH" .env.local
```

**Output sekarang:**

```
NEXT_PUBLIC_USE_MOCK_AUTH=true  ← Mock mode aktif
```

**Target untuk API real:**

```
NEXT_PUBLIC_USE_MOCK_AUTH=false  ← API real aktif
```

### Cek API URL:

```bash
grep "API_URL" .env.local
```

**Output:**

```
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

---

## ⚠️ Troubleshooting API Real

### Jika Error "fetch failed"

**Penyebab:**

- VPN tidak aktif
- Koneksi internet bermasalah
- API server down
- Endpoint URL salah

**Solusi:**

1. Aktifkan VPN (jika API internal)
2. Test koneksi: `ping api.pupuk-kujang.co.id`
3. Test API dengan cURL:
   ```bash
   curl -X POST https://api.pupuk-kujang.co.id/demplon/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"3082625","password":"PASSWORD"}'
   ```

### Jika Error "Unauthorized"

**Penyebab:**

- Username/password salah
- User tidak punya akses ke aplikasi SIADIL
- Aplikasi belum di-assign ke user

**Solusi:**

- Cek credentials
- Hubungi admin untuk assign aplikasi
- Gunakan mock mode untuk development

---

## 💡 Recommendation

### Untuk Development & Testing UI:

```env
✅ NEXT_PUBLIC_USE_MOCK_AUTH=true
```

- Tidak perlu VPN
- Tidak perlu internet
- Cepat untuk testing
- Tidak beban server

### Untuk Testing Integration:

```env
✅ NEXT_PUBLIC_USE_MOCK_AUTH=false
```

- Test koneksi API
- Test response handling
- Validasi data structure

### Untuk Production:

```env
✅ NEXT_PUBLIC_USE_MOCK_AUTH=false (WAJIB)
```

- Harus pakai API real
- User login dengan NIP & password asli

---

## 🎯 Summary

### ❌ Saat Ini (Mock Mode):

- Tidak menggunakan endpoint Pak Tono
- Data dummy (Administrator, User Demo)
- Login: admin/admin123
- Tidak ada network request ke API

### ✅ Setelah Aktifkan (Real API):

- Menggunakan endpoint Pak Tono
- Data real dari API (Tono Sartono, dll)
- Login: 3082625/password-asli
- Ada network request ke API

---

**File to Edit:** `.env.local`
**Line to Change:** `NEXT_PUBLIC_USE_MOCK_AUTH=true` → `false`
**Action Required:** Restart server (`npm run dev`)
**Documentation:** `API_STATUS_CHECK.md`
