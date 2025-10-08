# 📁 SIADIL - Sistem Arsip Digital

Web application untuk sistem manajemen arsip digital Demplon, dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

## ✨ Features

- 🔐 **Authentication System** - Login dengan NextAuth.js terintegrasi dengan API Demplon
- 📊 **Dashboard** - Dashboard utama dengan overview data
- 📄 **Document Management** - Sistem manajemen dokumen dan arsip
- 👥 **User Profile** - Profile dengan foto dari API dan informasi organisasi
- 🔒 **Protected Routes** - Middleware untuk proteksi halaman
- 🎨 **Modern UI** - Design modern dengan Tailwind CSS
- 📱 **Responsive** - Mobile-friendly design

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

### 4. Login

Navigate to `/login` and use your Demplon credentials to access the system.

## 📚 Documentation

- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Quick setup guide untuk memulai
- **[AUTH_README.md](./AUTH_README.md)** - Dokumentasi lengkap sistem autentikasi
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Detail integrasi dengan API Demplon
- **[API_TEST.md](./API_TEST.md)** - Cara test API login

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js
- **UI Components:** Radix UI, Lucide Icons
- **State Management:** React Hooks
- **Date Handling:** date-fns
- **Notifications:** Sonner

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── login/                    # Login page
│   ├── dashboard/                # Dashboard & sub-pages
│   │   ├── siadil/              # SIADIL main app
│   │   ├── profile/             # User profile
│   │   └── ...                  # Other modules
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/
│   ├── ProfileSection.tsx       # User profile with logout
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Providers.tsx            # SessionProvider wrapper
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   └── utils.ts                 # Utility functions
├── types/
│   └── next-auth.d.ts           # NextAuth type definitions
└── middleware.ts                # Route protection middleware
```

## 🔐 Authentication Flow

1. User enters credentials at `/login`
2. NextAuth calls API: `POST /auth/login`
3. API validates and returns user data
4. Session created with JWT token
5. User redirected to `/dashboard`
6. Protected routes check session via middleware

## 🎨 Key Features Detail

### Login System

- Modern gradient design
- Show/hide password toggle
- Real-time error handling
- Loading states
- API integration with Demplon backend

### Profile Section

- User photo from API (with fallback)
- Display name, username, organization
- Logout button on hover
- Responsive for collapsed sidebar

### Document Management (SIADIL)

- Create, read, update, delete documents
- Archive management
- Search and filter
- Tag management
- History tracking

## 🔧 Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## 🐛 Troubleshooting

### CORS Error

API must allow requests from your domain. Contact backend team.

### Session Not Persisting

1. Restart dev server after changing `.env.local`
2. Clear browser cookies
3. Check `NEXTAUTH_SECRET` is set

### Photo Not Loading

- Ensure photo URL is HTTPS
- Check CORS settings on image server
- Fallback to initials works automatically

## 📝 Environment Variables

```env
# Required
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<random-32-char-string>
NEXT_PUBLIC_API_URL=https://api.pupuk-kujang.co.id/demplon

# Optional (for production)
NODE_ENV=production
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Other Platforms

Compatible with any Node.js hosting:

- Netlify
- Railway
- AWS
- Google Cloud

## 📦 Dependencies

### Core

- next: 15.5.2
- react: 19.1.0
- typescript: ^5

### Authentication

- next-auth: latest
- bcryptjs: latest

### UI

- tailwindcss: ^3.4.17
- @radix-ui/react-\*: latest
- lucide-react: ^0.544.0

### Utilities

- date-fns: ^4.1.0
- clsx: ^2.1.1
- sonner: ^2.0.7

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is proprietary software for Demplon internal use.

## 👥 Team

Developed by Demplon IT Team

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** ✅ Production Ready
=======

# website-siadil

> > > > > > > f6fd35157e148b9c4d6d14348796616f8458476a
