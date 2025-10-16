# 🔧 SIADIL - Troubleshooting Guide

## ❌ Problem: Login Error - Internal Server Error

### Error Message:

```
Internal Server Error
Cannot read properties of undefined (reading 'call')
```

### 🔍 Root Cause:

Error ini disebabkan oleh **corrupted cache** di folder `.next` setelah melakukan perubahan besar pada code atau setelah multiple hot-reload.

Next.js 15 memiliki issue dengan cache webpack yang kadang tidak ter-invalidate dengan benar saat ada perubahan pada API routes atau authentication configuration.

---

## ✅ Solution: Clean Cache & Restart

### Method 1: Manual Clean (Recommended)

**Step 1: Stop Development Server**

- Tekan `Ctrl + C` di terminal
- Atau close terminal yang menjalankan `npm run dev`

**Step 2: Delete Cache Folders**

```bash
# Di root project folder
rm -rf .next
rm -rf node_modules/.cache
```

**Step 3: Restart Server**

```bash
npm run dev
```

### Method 2: Using NPM Scripts

Tambahkan script ke `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "clean": "rm -rf .next node_modules/.cache",
    "dev:clean": "npm run clean && npm run dev"
  }
}
```

Kemudian jalankan:

```bash
npm run dev:clean
```

---

## 🎯 When to Clean Cache?

Clean cache ketika mengalami masalah ini:

### 1. **Authentication Errors**

- ❌ `Cannot read properties of undefined`
- ❌ `Internal Server Error` di `/api/auth/error`
- ❌ Login button tidak response
- ❌ Redirect loop setelah login

### 2. **Build Errors**

- ❌ Webpack compilation errors
- ❌ Module not found (padahal file ada)
- ❌ Type errors yang tidak masuk akal
- ❌ Fast refresh reload terus-menerus

### 3. **After Major Changes**

- 🔄 Update Next.js version
- 🔄 Install/uninstall packages
- 🔄 Change API routes structure
- 🔄 Modify authentication logic
- 🔄 Update environment variables

---

## 🚀 Prevention Tips

### 1. **Restart Server Properly**

Jangan force-kill terminal. Gunakan `Ctrl + C` untuk graceful shutdown.

### 2. **Clean Before Production Build**

```bash
npm run clean && npm run build
```

### 3. **Use Git Ignore**

Pastikan `.gitignore` sudah include:

```
.next/
node_modules/
*.log
.env.local
.DS_Store
```

### 4. **Environment Variables**

Setelah update `.env.local`, restart server:

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔍 Debugging Steps

### Step 1: Check Terminal Output

Look for these indicators:

```
✓ Compiled /api/auth/[...nextauth] in X ms
[next-auth][warn][DEBUG_ENABLED]
🔧 [DEV MODE] Using mock authentication
```

### Step 2: Test Login

**Mock Credentials (Dev Mode):**

- Admin: `admin` / `admin123`
- User: `user` / `user123`

### Step 3: Check Browser Console

Open DevTools (F12) and look for:

- Network requests to `/api/auth/callback/credentials`
- Response status (should be 200 for success)
- Any JavaScript errors

### Step 4: Check Environment

Verify `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
NEXT_PUBLIC_USE_MOCK_AUTH=true
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:**

```
Port 3000 is in use
```

**Solution:**

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Issue 2: NEXTAUTH_SECRET Missing

**Error:**

```
[next-auth][error] NO_SECRET
```

**Solution:**
Add to `.env.local`:

```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Issue 3: Module Not Found

**Error:**

```
Module not found: Can't resolve 'next-auth'
```

**Solution:**

```bash
npm install next-auth
# or
npm install
```

### Issue 4: TypeScript Errors

**Error:**

```
Type error: Property 'username' does not exist
```

**Solution:**
Check `src/types/next-auth.d.ts` exists with proper declarations.

---

## 📊 Performance Tips

### 1. **Reduce Compilation Time**

```javascript
// next.config.ts
export default {
  // Enable SWC minification
  swcMinify: true,

  // Experimental features
  experimental: {
    optimizeCss: true,
  },
};
```

### 2. **Optimize Dev Server**

```bash
# Use turbo mode (faster)
npm run dev --turbo
```

### 3. **Clear Node Modules (Nuclear Option)**

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🔒 Security Checklist

### Before Production:

- [ ] Change `NEXTAUTH_SECRET` to secure random string
- [ ] Set `NEXT_PUBLIC_USE_MOCK_AUTH=false`
- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Remove console.log statements
- [ ] Test with real API credentials
- [ ] Enable HTTPS
- [ ] Set proper CORS headers
- [ ] Implement rate limiting

---

## 📝 Logs to Check

### 1. **Server Logs**

Terminal output shows:

- Compilation status
- API requests (GET/POST)
- Authentication flow
- Errors with stack traces

### 2. **Browser Console**

DevTools Console shows:

- Client-side errors
- Network requests
- State management issues

### 3. **NextAuth Debug Logs**

Set in `src/lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  debug: true, // Enable verbose logging
  // ... rest of config
};
```

---

## 🎓 Best Practices

### 1. **Development Workflow**

```bash
# Morning routine
git pull origin main
npm install  # If package.json changed
npm run clean
npm run dev

# After major changes
npm run clean && npm run dev

# Before commit
npm run build  # Test production build
```

### 2. **Testing Login**

```javascript
// Use mock mode for testing
NEXT_PUBLIC_USE_MOCK_AUTH = true;

// Test credentials
admin / admin123;
user / user123;
```

### 3. **Git Workflow**

```bash
# Before switching branches
npm run clean

# After switching
npm install
npm run dev
```

---

## 🆘 Still Having Issues?

### Check These Files:

1. **`src/lib/auth.ts`** - Authentication configuration
2. **`src/app/api/auth/[...nextauth]/route.ts`** - API route handler
3. **`.env.local`** - Environment variables
4. **`src/types/next-auth.d.ts`** - Type declarations
5. **`next.config.ts`** - Next.js configuration

### Verify Installation:

```bash
npm list next-auth
npm list next
npm list react
```

### Full Reset (Last Resort):

```bash
# 1. Clean everything
rm -rf .next node_modules package-lock.json

# 2. Reinstall
npm install

# 3. Clean cache
npm run clean

# 4. Restart
npm run dev
```

---

## 📞 Support

**Documentation:**

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

**Common Patterns:**

```typescript
// Check if user is authenticated
const { data: session, status } = useSession();
if (status === "loading") return <div>Loading...</div>;
if (!session) return <div>Not authenticated</div>;

// Programmatic navigation after login
const router = useRouter();
if (result?.ok) {
  router.push("/dashboard");
  router.refresh();
}
```

---

## ✅ Summary

**Quick Fix for Login Error:**

1. Stop server (`Ctrl + C`)
2. Run: `rm -rf .next node_modules/.cache`
3. Run: `npm run dev`
4. Test login with `admin` / `admin123`

**Prevention:**

- Clean cache after major changes
- Restart server properly
- Keep dependencies updated
- Use proper git workflow

**Remember:**

- Mock mode: `NEXT_PUBLIC_USE_MOCK_AUTH=true`
- Production: `NEXT_PUBLIC_USE_MOCK_AUTH=false`
- Always test build before deploy

---

**Document Version:** 1.0  
**Last Updated:** October 7, 2025  
**Project:** SIADIL - Sistem Arsip Digital
