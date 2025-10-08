# 🔐 Dokumentasi Sistem Login SIADIL

Sistem autentikasi untuk aplikasi SIADIL menggunakan NextAuth.js v4.

## 📋 Fitur

- ✅ Login menggunakan username dan password
- ✅ Session management dengan JWT
- ✅ Protected routes dengan middleware
- ✅ Auto-redirect ke login jika belum autentikasi
- ✅ Profil user di sidebar dengan tombol logout
- ✅ Role-based user data (admin, user)

## 🚀 Setup

### 1. Install Dependencies

Dependencies sudah terinstall:

- `next-auth` - Framework autentikasi
- `bcryptjs` - Hashing password
- `@types/bcryptjs` - TypeScript types

### 2. Environment Variables

File `.env.local` sudah dibuat dengan konfigurasi:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
```

⚠️ **PENTING**: Untuk production, ganti `NEXTAUTH_SECRET` dengan string random yang aman. Generate dengan:

```bash
openssl rand -base64 32
```

### 3. Struktur File

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API routes
│   ├── login/
│   │   └── page.tsx                  # Halaman login
│   └── layout.tsx                    # Root layout dengan SessionProvider
├── components/
│   ├── Providers.tsx                 # SessionProvider wrapper
│   └── ProfileSection.tsx            # Profil user & logout button
├── lib/
│   └── auth.ts                       # Konfigurasi NextAuth
├── types/
│   └── next-auth.d.ts                # TypeScript declarations
└── middleware.ts                     # Protected routes middleware
```

## 👤 Demo Akun

### Admin

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin
- **NIP**: 199001012020121001

### User Biasa

- **Username**: `user`
- **Password**: `user123`
- **Role**: User
- **NIP**: 199002022020122002

## 🔒 Protected Routes

Routes yang dilindungi (perlu login):

- `/dashboard/*` - Semua halaman dashboard
- `/profile/*` - Halaman profil

Routes public (tidak perlu login):

- `/login` - Halaman login
- `/` - Landing page

## 📝 Cara Menggunakan

### 1. Jalankan Development Server

```bash
npm run dev
```

### 2. Akses Aplikasi

Buka browser dan akses: `http://localhost:3000`

### 3. Login

- Klik menu atau akses `/login`
- Masukkan username dan password (gunakan demo akun di atas)
- Setelah login, akan redirect ke `/dashboard`

### 4. Logout

- Hover pada profil di sidebar
- Klik icon logout (merah)

## 🛠️ Customization

### Menambah User Baru

Edit file `src/lib/auth.ts`, tambahkan user di array `users`:

```typescript
const users = [
  {
    id: "3",
    username: "newuser",
    password: "$2a$10$...", // Generate hash password
    name: "User Baru",
    nip: "199003032020123003",
    role: "user",
    divisi: "Marketing",
  },
];
```

**Generate password hash:**

```javascript
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("password123", 10);
console.log(hash);
```

### Integrasi dengan Database

Untuk production, ganti mock data dengan database:

1. Install Prisma atau database adapter lain
2. Update `authorize` function di `src/lib/auth.ts`
3. Query user dari database
4. Verifikasi password dengan bcrypt

Contoh:

```typescript
async authorize(credentials) {
  // Query dari database
  const user = await prisma.user.findUnique({
    where: { username: credentials.username }
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // Verifikasi password
  const isValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isValid) {
    throw new Error("Password salah");
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    // ... data lainnya
  };
}
```

### Menambah Role-Based Access

Edit `src/middleware.ts` untuk cek role:

```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Hanya admin bisa akses /admin
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
```

## 🔑 Session Data

Setelah login, data session berisi:

```typescript
{
  user: {
    id: string;
    username: string;
    name: string;
    nip: string;
    role: string;
    divisi: string;
  }
}
```

### Mengakses Session di Client Component

```typescript
"use client";
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;

  return <div>Welcome, {session?.user?.name}</div>;
}
```

### Mengakses Session di Server Component

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

## 🐛 Troubleshooting

### Error: NEXTAUTH_SECRET not set

**Solusi**: Pastikan file `.env.local` ada dan berisi `NEXTAUTH_SECRET`

### Session hilang setelah refresh

**Solusi**: Pastikan `Providers` component membungkus aplikasi di `layout.tsx`

### Redirect loop

**Solusi**: Cek middleware config, pastikan `/login` tidak di-protect

### Type errors

**Solusi**: Restart TypeScript server di VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

## 📚 Dokumentasi Lengkap

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## 🔐 Security Notes

1. **NEVER** commit `.env.local` ke Git
2. Gunakan strong secret untuk production (minimal 32 karakter)
3. Selalu hash password dengan bcrypt
4. Implement rate limiting untuk login endpoint
5. Gunakan HTTPS di production
6. Set secure cookies di production
7. Implement CSRF protection (NextAuth sudah include)

## 🎨 UI/UX Features

- Modern gradient design
- Responsive layout
- Show/hide password toggle
- Loading states
- Error messages
- Demo credentials displayed
- Smooth transitions
- Hover effects

---

**Dibuat untuk**: Web SIADIL - Sistem Arsip Digital
**Tech Stack**: Next.js 15, NextAuth.js, TypeScript, Tailwind CSS


## ��� Panduan Login Praktis

### Mode Development (Mock Authentication)

Sistem menggunakan **Mock Authentication** untuk testing tanpa perlu API real.

#### Langkah-langkah Login:

1. **Buka browser** → `http://localhost:3001/login`

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

### Switching Modes

**Development Mode (Mock) → Production Mode (Real API)**

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

### Testing Checklist

- [ ] Login dengan admin → Success
- [ ] Login dengan user → Success
- [ ] Login dengan credentials salah → Error message muncul
- [ ] Akses `/dashboard` tanpa login → Redirect ke `/login`
- [ ] Logout → Redirect ke `/login`
- [ ] Login lagi → Dashboard accessible
- [ ] Profile data tampil di sidebar
- [ ] Session persist setelah refresh

### Troubleshooting Login

**Error: "fetch failed"**
- API endpoint tidak bisa diakses
- Tidak terhubung ke VPN/network internal
- Gunakan Mock Mode untuk testing

**Error: "Username atau password salah"**
- Mode Development: Gunakan credentials demo di atas
- Mode Production: Gunakan credentials Demplon Anda

**Session Tidak Tersimpan**
1. Clear browser cookies
2. Cek `NEXTAUTH_SECRET` di `.env.local`
3. Pastikan `Providers` wrapper ada di `layout.tsx`
