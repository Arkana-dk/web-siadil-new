# Dynamic Personal Card with Profile Photo

## 📸 Ringkasan Update

Card **"Personal"** di dashboard SIADIL sekarang menampilkan **foto profil user** dari API session, bukan hanya inisial!

### ✨ Fitur Baru:

1. **Foto Profil User** ditampilkan di circle (bukan hanya inisial)
2. **Fallback ke Inisial** jika foto tidak tersedia atau gagal load
3. **Auto-update** dari session API secara real-time
4. **Error Handling** untuk broken images

---

## 🎯 Cara Kerja

### Flow Data:

```
API Response (session.user.pic)
    ↓
page.tsx (userData.photo)
    ↓
ArchiveView/DocumentView (userPhoto prop)
    ↓
PersonalArchiveCard (displays photo or initials)
```

### Komponen yang Diubah:

#### 1. **ArchiveCards.tsx** - Display Logic

```tsx
// Menambahkan Image component dari Next.js
import Image from "next/image";
import { useState } from "react";

const PersonalArchiveCard = ({
  userPhoto, // ← NEW PROP
  // ... other props
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="...">
      {userPhoto && !imageError ? (
        // Tampilkan foto user
        <Image
          src={userPhoto}
          alt={userName || "User"}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback ke inisial
        <span>{getInitials(userName)}</span>
      )}
    </div>
  );
};
```

#### 2. **page.tsx** - Data Source

```tsx
const userData = {
  name: session?.user?.name || "Guest",
  id: session?.user?.username || session?.user?.id || "000000",
  photo: session?.user?.pic || undefined, // ← NEW FIELD
};

// Pass to components:
<ArchiveView
  userName={userData.name}
  userId={userData.id}
  userPhoto={userData.photo} // ← NEW PROP
/>;
```

#### 3. **ArchiveView.tsx & DocumentView.tsx**

- Menambahkan `userPhoto?: string` ke interface
- Meneruskan prop ke `PersonalArchiveCard`

---

## 🧪 Testing

### Mode Mock (Development):

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_AUTH=true

# Login credentials:
Username: admin
Password: admin123

# Result:
- Foto: https://randomuser.me/api/portraits/men/1.jpg
- Fallback (jika gagal): Initials "AD"
```

### Mode Real API:

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_AUTH=false

# Login dengan credentials PT Pupuk Kujang
# Card akan menampilkan:
- Foto profil dari: session.user.pic
- Contoh URL: https://statics.pupuk-kujang.co.id/foto/[employee_id].jpg
```

---

## 📝 API Response Structure

```typescript
{
  "status": 1,
  "message": "Login success",
  "data": {
    "id": "10122059",
    "username": "10122059",
    "name": "Dede Firmansyah",
    "pic": "https://statics.pupuk-kujang.co.id/foto/10122059.jpg",  // ← Foto profil
    "organization": {
      "id": "ORG001",
      "name": "PT Pupuk Kujang"
    },
    // ... other fields
  }
}
```

---

## 🎨 Visual Result

### Sebelum (Hardcoded):

```
┌─────────────────────────┐
│  ┌───┐                  │
│  │ DF│  Personal        │
│  └───┘  10122059        │ ← Hardcoded
│                         │
│  Personal               │
└─────────────────────────┘
```

### Sesudah (Dynamic dengan Foto):

```
┌─────────────────────────┐
│  ┌───┐                  │
│  │ 📷│  Personal        │
│  └───┘  10122059        │ ← Dynamic dari API
│                         │
│  Personal               │
└─────────────────────────┘
```

---

## 🔧 Error Handling

### Scenario 1: Foto berhasil load

```tsx
userPhoto="https://statics.pupuk-kujang.co.id/foto/10122059.jpg"
→ Tampilkan foto user
```

### Scenario 2: Foto gagal load (404, network error, dll)

```tsx
onError={() => setImageError(true)}
→ Fallback ke initials "DF"
```

### Scenario 3: Tidak ada foto (pic = null/undefined)

```tsx
userPhoto={undefined}
→ Langsung tampilkan initials "DF"
```

---

## 🚀 Cara Test

```bash
# 1. Start development server
npm run dev

# 2. Buka browser
http://localhost:3000

# 3. Login dengan mock account
Username: admin
Password: admin123

# 4. Lihat card "Personal"
- Harus muncul foto profil dari randomuser.me
- Jika foto gagal load, muncul initials "AD"

# 5. Test dengan real API (via VPN)
NEXT_PUBLIC_USE_MOCK_AUTH=false
- Login dengan credentials PT Pupuk Kujang
- Foto dari statics.pupuk-kujang.co.id
```

---

## 📦 Dependencies

- **Next.js Image Component**: Built-in optimization
- **React useState**: Error state management
- **TypeScript**: Type safety

---

## ✅ Checklist

- [x] Menambahkan prop `userPhoto` ke PersonalArchiveCard
- [x] Import Next.js Image component
- [x] Implement error handling dengan useState
- [x] Update ArchiveView interface
- [x] Update DocumentView interface
- [x] Pass userPhoto dari page.tsx
- [x] Get photo from session.user.pic
- [x] Fallback ke initials jika foto error
- [x] Test dengan mock data
- [x] No TypeScript errors

---

## 🎉 Result

Card "Personal" sekarang **100% dynamic** dengan:

- ✅ **Foto profil** dari API session
- ✅ **Nama user** dari API
- ✅ **User ID** dari API
- ✅ **Fallback** ke initials jika foto gagal
- ✅ **Error handling** untuk broken images
- ✅ **Auto-update** saat login dengan user berbeda

---

## 📚 Related Files

1. `src/app/dashboard/siadil/components/ui/ArchiveCards.tsx`
2. `src/app/dashboard/siadil/components/views/ArchiveView.tsx`
3. `src/app/dashboard/siadil/components/views/DocumentView.tsx`
4. `src/app/dashboard/siadil/page.tsx`
5. `src/lib/auth.ts` - Session configuration
6. `next.config.ts` - Image domains configuration

---

## 🔗 Next.js Image Configuration

Pastikan domain foto sudah dikonfigurasi di `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "randomuser.me", // Mock data
    },
    {
      protocol: "https",
      hostname: "statics.pupuk-kujang.co.id", // Real API
    },
  ],
},
```

✅ Sudah dikonfigurasi!
