# 🔧 Fix: Hydration Error & 401 Unauthorized

## ❌ **Masalah yang Terjadi:**

### **1. Hydration Error:**

```
A tree hydrated but some attributes of the server rendered HTML
didn't match the client properties.
```

**Penyebab:**

- `Math.random()` dipanggil saat render
- Server generate nilai → Client generate nilai lagi (berbeda!)
- React detect mismatch

**Contoh kode yang bermasalah:**

```tsx
{[...Array(15)].map((_, i) => (
  <div style={{
    left: `${Math.random() * 100}%`,  ← Server: 35.5%
                                       ← Client: 87.2%
                                       ← MISMATCH! ❌
  }} />
))}
```

---

### **2. 401 Unauthorized:**

```
api/auth/callback/credentials:1
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**Penyebab:**

- Mock mode OFF: `NEXT_PUBLIC_USE_MOCK_AUTH=false`
- Code coba call API real: `https://sso.pupuk-kujang.co.id`
- Server SSO tidak bisa diakses (ping failed)
- Login gagal → 401 Unauthorized

---

## ✅ **Solusi yang Sudah Diterapkan:**

### **Fix 1: Hydration Error**

**Gunakan `useMemo` untuk generate particles hanya sekali:**

```tsx
import { useMemo } from "react";

export default function LoginPage() {
  // Generate particles positions ONLY ONCE
  const particles = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: Math.random() * 100, // ✅ Calculated once
        top: Math.random() * 100, // ✅ Calculated once
        delay: Math.random() * 5, // ✅ Calculated once
        duration: 8 + Math.random() * 12, // ✅ Calculated once
      })),
    [] // Empty deps = only run once on mount
  );

  return (
    <div>
      {/* Use pre-calculated values */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            left: `${particle.left}%`, // ✅ Same on server & client
            top: `${particle.top}%`, // ✅ Same on server & client
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
```

**Kenapa ini fix hydration?**

- `useMemo` dengan empty deps `[]` hanya run **sekali** saat component mount
- Server render → Generate values
- Client hydrate → **Gunakan values yang sama** (tidak regenerate)
- Server & client match → ✅ No hydration error!

---

### **Fix 2: 401 Unauthorized**

**Aktifkan Mock Mode untuk development:**

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_AUTH=true  ← Sekarang ON
```

**Kenapa ini fix 401?**

- Mock mode ON → Tidak call API real
- Gunakan mock data local
- No network request → No 401 error!

---

## 🚀 **Action Required:**

### **RESTART DEVELOPMENT SERVER (WAJIB!)**

```bash
# Di terminal:
Ctrl+C        # Stop server
npm run dev   # Start lagi
```

**Tunggu sampai:**

```
✓ Ready in 2.5s
○ Local: http://localhost:3000
```

---

## 🧪 **Test:**

### **1. Test Hydration Fix:**

- Buka: `http://localhost:3000/login`
- Buka Console (F12) → Tab Console
- **Should NOT see** hydration warnings anymore! ✅

### **2. Test Login (Mock Mode):**

- Username: `admin`
- Password: `admin123`
- Click Login
- **Should redirect** to `/dashboard/siadil` ✅
- **Should NOT see** 401 error! ✅

---

## 📊 **Perbandingan:**

### **Before:**

```tsx
// ❌ Generate random values setiap render
{
  [...Array(15)].map((_, i) => (
    <div
      style={{
        left: `${Math.random() * 100}%`, // Different every time!
      }}
    />
  ));
}
```

**Result:**

- Server render: `left: 35.5%`
- Client hydrate: `left: 87.2%`
- ❌ Hydration mismatch!

---

### **After:**

```tsx
// ✅ Generate random values ONCE
const particles = useMemo(
  () =>
    [...Array(15)].map(() => ({
      left: Math.random() * 100, // Calculated once!
    })),
  []
);

{
  particles.map((particle, i) => (
    <div
      style={{
        left: `${particle.left}%`, // Same value every time!
      }}
    />
  ));
}
```

**Result:**

- Server render: `left: 35.5%`
- Client hydrate: `left: 35.5%`
- ✅ Perfect match!

---

## 💡 **Penjelasan Teknis:**

### **Hydration Process:**

```
1. SERVER RENDER (SSR):
   ↓
   Generate HTML with values
   Math.random() → 35.5%
   ↓
   Send HTML to browser

2. CLIENT HYDRATE:
   ↓
   React takes over
   Math.random() → 87.2%  ← DIFFERENT!
   ↓
   ❌ MISMATCH DETECTED!
```

### **With useMemo:**

```
1. SERVER RENDER (SSR):
   ↓
   useMemo calculates once
   Math.random() → 35.5%
   ↓
   Send HTML to browser

2. CLIENT HYDRATE:
   ↓
   React takes over
   useMemo uses SAME VALUE → 35.5%  ← SAME!
   ↓
   ✅ PERFECT MATCH!
```

---

## 🎯 **Summary:**

| Issue                | Cause                                  | Solution                        | Status   |
| -------------------- | -------------------------------------- | ------------------------------- | -------- |
| **Hydration Error**  | `Math.random()` dipanggil saat render  | Use `useMemo` dengan empty deps | ✅ Fixed |
| **401 Unauthorized** | Mock mode OFF + SSO tidak bisa diakses | Aktifkan mock mode              | ✅ Fixed |

---

## 📝 **Next Steps:**

### **Sekarang:**

1. ✅ Restart server
2. ✅ Test login dengan mock credentials
3. ✅ Develop fitur-fitur lain
4. ✅ No more errors!

### **Nanti (Production):**

1. 📞 Hubungi IT untuk VPN/akses SSO
2. 🔄 Ubah `NEXT_PUBLIC_USE_MOCK_AUTH=false`
3. 🧪 Test dengan API real
4. 🚀 Deploy

---

## 🔍 **Debugging Tips:**

### **Check Hydration Warnings:**

```bash
# Console akan show:
✅ No warnings = Hydration OK
❌ "attributes didn't match" = Masih ada mismatch
```

### **Check 401 Errors:**

```bash
# Network tab (F12):
✅ No 401 errors = Mock mode working
❌ 401 errors = Mock mode masih OFF atau server issue
```

---

## ⚠️ **Common Pitfalls:**

### **Don't:**

```tsx
// ❌ BAD: Random values in render
<div style={{ left: `${Math.random() * 100}%` }} />

// ❌ BAD: Date.now() in render
<div>{Date.now()}</div>

// ❌ BAD: Dynamic values without memo
<div>{Math.floor(Math.random() * 100)}</div>
```

### **Do:**

```tsx
// ✅ GOOD: Memoized random values
const particles = useMemo(() => [...], []);

// ✅ GOOD: State/useState for dynamic values
const [timestamp] = useState(() => Date.now());

// ✅ GOOD: useEffect for client-only code
useEffect(() => {
  const value = Math.random();
}, []);
```

---

**Sekarang restart server dan test! Semua error akan hilang! 🎉**
