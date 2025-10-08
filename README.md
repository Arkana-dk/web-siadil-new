# 📁 SIADIL - Sistem Arsip Digital

Web application untuk sistem manajemen arsip digital Demplon, dibangun dengan Next.js 15, TypeScript, dan Tailwind CSS.

> 🔗 **GitHub Repository**: [Arkana-dk/website-siadil](https://github.com/Arkana-dk/website-siadil)

## ✨ Features

- 🔐 **Authentication System** - Login dengan NextAuth.js terintegrasi dengan API Pupuk Kujang SSO
- 🔑 **Access Token Management** - Automatic token handling untuk API calls
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
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Development Mode (true = mock auth, false = real API)
NEXT_PUBLIC_USE_MOCK_AUTH=false
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser.

### 4. Login

Navigate to `/login` and use your credentials:
- **Development Mode**: username: `admin`, password: `admin123`
- **Production Mode**: Use your real Pupuk Kujang SSO credentials

## 📚 Documentation

### Authentication & API
- **[AUTH_README.md](./AUTH_README.md)** - Dokumentasi lengkap sistem autentikasi
- **[ACCESS_TOKEN_GUIDE.md](./ACCESS_TOKEN_GUIDE.md)** - Panduan lengkap access token
- **[ACCESS_TOKEN_EXAMPLES.md](./ACCESS_TOKEN_EXAMPLES.md)** - Contoh praktis penggunaan token
- **[HOW_TO_CHECK_TOKEN.md](./HOW_TO_CHECK_TOKEN.md)** - Cara cek token aktif
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Detail integrasi dengan API
- **[API_REAL_CONNECTION_GUIDE.md](./API_REAL_CONNECTION_GUIDE.md)** - Cara koneksi ke API real

### Setup & Troubleshooting
- **[QUICK_SETUP.md](./QUICK_SETUP.md)** - Quick setup guide untuk memulai
- **[FIX_ACCESS_TOKEN_ISSUE.md](./FIX_ACCESS_TOKEN_ISSUE.md)** - Fix token tidak muncul
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js v4
- **UI Components:** Radix UI, Lucide Icons
- **State Management:** React Hooks
- **Date Handling:** date-fns
- **Notifications:** Sonner
- **Excel Export:** xlsx

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── login/                    # Login page
│   ├── dashboard/                # Dashboard & sub-pages
│   │   ├── siadil/              # SIADIL main app
│   │   ├── profile/             # User profile
│   │   ├── test-token/          # Token testing page
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
│   ├── api.ts                   # API utility functions with token
│   └── utils.ts                 # Utility functions
├── types/
│   └── next-auth.d.ts           # NextAuth type definitions
└── middleware.ts                # Route protection middleware
```

## 🔐 Authentication Flow

1. User enters credentials at `/login`
2. NextAuth calls API: `POST /login`
3. API validates and returns user data + **access token**
4. Session created with JWT token (includes accessToken)
5. User redirected to `/dashboard`
6. Protected routes check session via middleware
7. Access token automatically included in API requests

## 🔑 Access Token Usage

```typescript
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";

export default function MyComponent() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  // Use token for API calls
  const fetchData = async () => {
    const data = await apiGet("/api/documents", accessToken);
    console.log(data);
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## 🎨 Key Features Detail

### Login System
- Modern gradient design
- Show/hide password toggle
- Real-time error handling
- Loading states
- API integration with Pupuk Kujang SSO
- Automatic token management

### Profile Section
- User photo from API (with fallback)
- Display name, username, organization
- Logout button on hover
- Responsive for collapsed sidebar

### Document Management (SIADIL)
- Create, read, update, delete documents
- Archive management with nested folders
- Advanced search and filter
- Tag management
- History tracking
- Export to Excel
- Star/favorite documents
- Trash management

### Access Token Testing
- Navigate to `/dashboard/test-token`
- View token status, type, and content
- Test API calls with token
- Decode JWT tokens

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

### Generate Secrets
```bash
node scripts/generate-secret.js
```

## 🐛 Troubleshooting

### Access Token Not Showing
1. **Logout and login again**
2. Check terminal logs for token info
3. Visit `/dashboard/test-token` to verify
4. See [FIX_ACCESS_TOKEN_ISSUE.md](./FIX_ACCESS_TOKEN_ISSUE.md)

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

### Cannot Connect to API
- Check if you're on internal network or VPN
- Verify `NEXT_PUBLIC_API_URL` is correct
- See [API_REAL_CONNECTION_GUIDE.md](./API_REAL_CONNECTION_GUIDE.md)

## 📝 Environment Variables

```env
# Required
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<random-32-char-string>
NEXT_PUBLIC_API_URL=https://sso.pupuk-kujang.co.id

# Development Mode
NEXT_PUBLIC_USE_MOCK_AUTH=false  # true for mock, false for real API

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
- next-auth: ^4.24.11

### UI
- tailwindcss: ^3.4.17
- @radix-ui/react-*: latest
- lucide-react: ^0.544.0

### Utilities
- date-fns: ^4.1.0
- clsx: ^2.1.1
- sonner: ^2.0.7
- xlsx: ^0.18.5

## � Testing

### Check Access Token
```bash
# Open in browser
http://localhost:3001/dashboard/test-token
```

### Test API Connection
See [API_TEST.md](./API_TEST.md)

## �🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is proprietary software for Demplon/Pupuk Kujang internal use.

## 👥 Team

Developed by Demplon IT Team in collaboration with Pupuk Kujang

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** ✅ Production Ready  
**Repository:** [github.com/Arkana-dk/website-siadil](https://github.com/Arkana-dk/website-siadil)
