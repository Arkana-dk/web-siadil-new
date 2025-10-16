# 🖼️ Fix: Next.js Image Unconfigured Host

## ❌ **Error yang Terjadi:**

```
Invalid src prop (https://statics.pupuk-kujang.co.id/demplon/picemp/12231149.jpg)
on `next/image`, hostname "statics.pupuk-kujang.co.id" is not configured
under images in your `next.config.js`
```

---

## 🔍 **Penyebab:**

### **Next.js Security Feature:**

Next.js Image component **tidak allow external images** secara default untuk:

- **Security** - Prevent arbitrary external images
- **Performance** - Control image optimization sources
- **Bandwidth** - Protect from abuse

### **Problem:**

Profile pictures dari API menggunakan URL:

```
https://statics.pupuk-kujang.co.id/demplon/picemp/12231149.jpg
```

Hostname `statics.pupuk-kujang.co.id` **belum di-whitelist** di config.

---

## ✅ **Solusi:**

### **Update `next.config.ts`:**

**Before:**

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: ["randomuser.me"],
  },
};
```

**After:**

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: [
      "randomuser.me",
      "statics.pupuk-kujang.co.id", // ✅ Added for employee pics
    ],
  },
};
```

---

## 🚀 **Action Required:**

### **RESTART DEVELOPMENT SERVER (WAJIB!):**

Changes to `next.config.ts` **require server restart!**

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

### **1. Login:**

```
# Mock mode:
Username: admin
Password: admin123

# Real API (with VPN):
Username: 3025
Password: xxxxx
```

### **2. Check Profile Picture:**

- Go to dashboard
- Profile picture di sidebar **should load** ✅
- No more image error! ✅

---

## 📊 **Penjelasan:**

### **Kenapa Perlu Whitelist?**

**Security:**

```
❌ Without whitelist:
   - Any external URL bisa di-load
   - Potential security risk
   - Bandwidth abuse possible

✅ With whitelist:
   - Hanya domain yang trusted
   - Controlled image sources
   - Better security
```

**Example URLs yang akan di-allow:**

```
✅ https://statics.pupuk-kujang.co.id/demplon/picemp/12231149.jpg
✅ https://statics.pupuk-kujang.co.id/demplon/picemp/3082625.jpg
✅ https://randomuser.me/api/portraits/men/1.jpg
❌ https://evil-site.com/image.jpg (not whitelisted)
```

---

## 🔧 **Alternative Solutions:**

### **Option 1: Use `remotePatterns` (More Flexible):**

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "statics.pupuk-kujang.co.id",
        pathname: "/demplon/picemp/**", // Only allow employee pics
      },
    ],
  },
};
```

**Benefits:**

- More specific control
- Can limit to specific paths
- Better security

---

### **Option 2: Use Regular `<img>` Tag (Not Recommended):**

```tsx
// ❌ NOT RECOMMENDED - Lose Next.js optimization
<img src={session.user.pic} alt={session.user.name} width={40} height={40} />
```

**Why not recommended:**

- ❌ No automatic optimization
- ❌ No lazy loading
- ❌ No responsive images
- ❌ Slower performance

---

### **Option 3: Fallback to Placeholder:**

If image fails to load, show placeholder:

```tsx
<Image
  src={session.user.pic || "/default-avatar.png"}
  alt={session.user.name}
  width={40}
  height={40}
  onError={(e) => {
    e.currentTarget.src = "/default-avatar.png";
  }}
/>
```

---

## 📝 **Best Practices:**

### **1. Add All Required Domains:**

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: [
      "statics.pupuk-kujang.co.id", // Employee pics
      "cdn.pupuk-kujang.co.id", // Other assets
      "randomuser.me", // Mock data (dev only)
    ],
  },
};
```

### **2. Use Environment Variables (Optional):**

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: [
      process.env.NEXT_PUBLIC_STATIC_DOMAIN || "statics.pupuk-kujang.co.id",
      "randomuser.me",
    ],
  },
};
```

### **3. Document Why Each Domain:**

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: [
      "randomuser.me", // Dev: Mock user avatars
      "statics.pupuk-kujang.co.id", // Prod: Employee profile pictures
    ],
  },
};
```

---

## 🐛 **Troubleshooting:**

### **Issue 1: Still Getting Error After Config Update**

**Solution:** Restart server (config changes need restart!)

```bash
Ctrl+C
npm run dev
```

### **Issue 2: Image Still Not Loading**

**Check:**

1. ✅ Server restarted?
2. ✅ Hostname spelling correct?
3. ✅ Image URL accessible in browser?

**Test in browser:**

```
https://statics.pupuk-kujang.co.id/demplon/picemp/12231149.jpg
```

### **Issue 3: Different Hostname in Production**

**Solution:** Add production hostname too:

```typescript
domains: [
  "statics.pupuk-kujang.co.id",      // Dev
  "cdn.pupuk-kujang.co.id",          // Prod (if different)
],
```

---

## 📊 **Summary:**

| Issue              | Cause                       | Solution                 | Status      |
| ------------------ | --------------------------- | ------------------------ | ----------- |
| **Image Error**    | Hostname not whitelisted    | Add to `domains` config  | ✅ Fixed    |
| **Config File**    | Missing hostname            | Updated `next.config.ts` | ✅ Done     |
| **Server Restart** | Config changes need restart | Restart dev server       | ⏳ Required |

---

## 🎯 **Expected Result:**

### **Before Fix:**

```
❌ Error: hostname "statics.pupuk-kujang.co.id" is not configured
❌ Profile picture tidak muncul
❌ Broken image icon
```

### **After Fix:**

```
✅ No error
✅ Profile picture loads correctly
✅ Next.js optimization applied (lazy load, responsive, etc.)
```

---

## 💡 **Additional Info:**

### **Next.js Image Optimization:**

When hostname is whitelisted, Next.js automatically:

- ✅ **Optimize image** (convert to WebP, resize, etc.)
- ✅ **Lazy load** (load only when visible)
- ✅ **Cache** (improve performance)
- ✅ **Responsive** (serve appropriate size for device)

### **URLs:**

**Development:**

```
Image source: https://statics.pupuk-kujang.co.id/demplon/picemp/12231149.jpg
Optimized by: Next.js Image Optimization API
Served from: /_next/image?url=...&w=40&q=75
```

**Production:**

```
Same optimization + CDN caching
```

---

**Fix applied! Restart server dan test lagi! Profile pictures akan load dengan sempurna! 🎉**
