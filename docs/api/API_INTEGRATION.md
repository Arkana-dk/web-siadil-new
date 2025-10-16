# 🔌 Integrasi API Login Demplon

Dokumentasi untuk integrasi sistem login SIADIL dengan API Demplon.

## 📡 Endpoint API

### Login Endpoint

```
POST https://api.pupuk-kujang.co.id/demplon/auth/login
```

### Request Body

```json
{
  "username": "3082625",
  "password": "your-password"
}
```

### Success Response (200 OK)

```json
{
  "success": true,
  "application": {
    "id": 21,
    "slug": "demplonadmin",
    "name": "Demplon Admin",
    "description": "Demplon Admin",
    "active": true
  },
  "roles": ["adminhrdemplonti"],
  "user": {
    "id": "3082625",
    "username": "3082625",
    "name": "Tono Sartono",
    "pic": "https://statics.pupuk-kujang.co.id/demplon/picemp/3082625.jpg",
    "email": "tono@pupuk-kujang.co.id",
    "organization": {
      "id": "C001370000",
      "name": "Departemen Mitra Bisnis Layanan TI PKC",
      "leader": true
    }
  }
}
```

### Error Response (401 Unauthorized)

```json
{
  "message": "App is not assigned to this employee or app is does not exist",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## 🔧 Konfigurasi

### 1. Environment Variables

File `.env.local`:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# API Configuration
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

⚠️ **PENTING**:

- Ganti `NEXT_PUBLIC_API_URL` jika API endpoint berbeda
- Gunakan URL lengkap tanpa trailing slash

### 2. Session Data Structure

Setelah login berhasil, session berisi:

```typescript
{
  user: {
    id: string;                    // User ID dari API
    username: string;              // Username
    name: string;                  // Nama lengkap
    email: string;                 // Email
    pic: string;                   // URL foto profil
    roles: string[];               // Array roles
    organization: {
      id: string;                  // Organization ID
      name: string;                // Nama organisasi/departemen
      leader: boolean;             // Apakah leader
    };
    application: {
      id: number;                  // Application ID
      slug: string;                // Application slug
      name: string;                // Application name
      description: string;         // Application description
      active: boolean;             // Status active
    };
  }
}
```

## 📝 Cara Menggunakan

### Mengakses Session di Client Component

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
      <p>Organization: {session.user.organization.name}</p>
      <p>Roles: {session.user.roles.join(", ")}</p>

      {session.user.pic && (
        <img src={session.user.pic} alt={session.user.name} />
      )}
    </div>
  );
}
```

### Mengakses Session di Server Component

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Server Side: {session.user.name}</h1>
      <p>Organization: {session.user.organization.name}</p>
    </div>
  );
}
```

### Cek Role/Permission

```typescript
"use client";
import { useSession } from "next-auth/react";

export function AdminPanel() {
  const { data: session } = useSession();

  // Cek apakah user memiliki role tertentu
  const isAdmin = session?.user.roles.includes("adminhrdemplonti");

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel Content</div>;
}
```

### Middleware untuk Role-Based Protection

Edit `src/middleware.ts`:

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Contoh: Hanya admin yang bisa akses /admin
    if (path.startsWith("/admin")) {
      const hasAdminRole = token?.roles?.some((role) => role.includes("admin"));

      if (!hasAdminRole) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

## 🎨 UI Features

### Profile Section dengan Data API

Profile di sidebar akan menampilkan:

- ✅ Foto profil dari API (dengan fallback ke inisial)
- ✅ Nama lengkap
- ✅ Username
- ✅ Nama organisasi
- ✅ Tombol logout

### Login Page

- Modern design dengan gradient
- Show/hide password toggle
- Error handling yang informatif
- Loading states
- Auto-redirect setelah login berhasil

## 🔒 Error Handling

### Penanganan Error dari API

```typescript
// Di src/lib/auth.ts, sudah di-handle:

try {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    // Error dari API akan di-throw dan ditampilkan di UI
    throw new Error(data.message || "Login gagal");
  }

  return data;
} catch (error) {
  // Error handling untuk network error, dll
  throw new Error("Terjadi kesalahan saat login");
}
```

### Error Messages yang Mungkin Muncul

1. **"App is not assigned to this employee or app is does not exist"**

   - User tidak memiliki akses ke aplikasi
   - Atau aplikasi tidak ditemukan

2. **"Username atau password salah"**

   - Kredensial tidak valid

3. **"Terjadi kesalahan saat login"**
   - Network error
   - API tidak respond
   - Server error

## 🧪 Testing

### 1. Test dengan Postman/Insomnia

```bash
POST https://api.pupuk-kujang.co.id/demplon/auth/login
Content-Type: application/json

{
  "username": "3082625",
  "password": "your-password"
}
```

### 2. Test di Browser

1. Jalankan dev server: `npm run dev`
2. Buka: `http://localhost:3001/login`
3. Masukkan username dan password yang valid
4. Cek console browser untuk error (F12)
5. Cek Network tab untuk melihat request/response

### 3. Debug Mode

Tambahkan di `src/lib/auth.ts` untuk debug:

```typescript
async authorize(credentials) {
  console.log("Login attempt:", credentials.username);

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  console.log("API Response Status:", response.status);

  const data = await response.json();
  console.log("API Response Data:", data);

  // ... rest of code
}
```

## 🐛 Troubleshooting

### CORS Error

Jika muncul CORS error di browser:

- API harus mengizinkan request dari domain Anda
- Hubungi admin API untuk whitelist domain
- Untuk development, mungkin perlu proxy

### Network Error

```
Error: Failed to fetch
```

**Solusi:**

1. Cek koneksi internet
2. Pastikan API URL benar di `.env.local`
3. Cek apakah API server running
4. Cek firewall/VPN

### 401 Unauthorized

**Solusi:**

1. Pastikan username & password benar
2. Cek apakah user memiliki akses ke aplikasi
3. Cek dengan tim backend tentang assignment aplikasi

### Session tidak tersimpan

**Solusi:**

1. Restart development server setelah ubah `.env.local`
2. Clear browser cookies
3. Cek `NEXTAUTH_SECRET` sudah di-set

## 🔄 Update API URL

Jika endpoint berubah, update di `.env.local`:

```env
# Development
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon

# Staging
NEXT_PUBLIC_API_URL=https://staging-api.pupuk-kujang.co.id/demplon

# Production
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

## 📚 Resources

- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**Catatan Keamanan:**

- ⚠️ NEVER commit `.env.local` ke Git
- 🔒 Gunakan HTTPS di production
- 🔐 Password dikirim langsung ke API (pastikan API menggunakan HTTPS)
- 🛡️ JWT token disimpan di cookie dengan flag httpOnly & secure

**Status:** ✅ Production Ready (setelah test dengan API real)
