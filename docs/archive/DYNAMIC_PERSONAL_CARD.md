# Dynamic Personal Archive Card

## 📋 Overview

Card "Personal" di dashboard SIADIL sekarang menampilkan data user secara **DYNAMIC** dari API session, bukan hardcoded lagi.

## ✅ Yang Sudah Diperbaiki

### 1. **PersonalArchiveCard Component**

**File:** `src/app/dashboard/siadil/components/ui/ArchiveCards.tsx`

**Before (Hardcoded):**

```tsx
<span className="text-xl font-bold tracking-wide text-white">DF</span>
<p className="mt-1 text-sm font-medium text-green-100">10122059</p>
```

**After (Dynamic):**

```tsx
const PersonalArchiveCard = ({
  archive,
  onClick,
  userName, // ✅ NEW: User name from API
  userId, // ✅ NEW: User ID from API
}: {
  archive: Archive;
  onClick: () => void;
  userName?: string;
  userId?: string;
}) => {
  // Generate initials from userName (e.g., "Dede Firmansyah" -> "DF")
  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="...">
      {/* Initials circle */}
      <span className="text-xl font-bold tracking-wide text-white">
        {getInitials(userName)} {/* ✅ Dynamic initials */}
      </span>

      {/* User ID */}
      <p className="mt-1 text-sm font-medium text-green-100">
        {userId || "N/A"} {/* ✅ Dynamic user ID */}
      </p>
    </div>
  );
};
```

### 2. **ArchiveView Component**

**File:** `src/app/dashboard/siadil/components/views/ArchiveView.tsx`

**Updated:**

```tsx
interface ArchiveViewProps {
  // ... existing props
  userName?: string;    // ✅ NEW
  userId?: string;      // ✅ NEW
}

const ArchiveView: React.FC<ArchiveViewProps> = ({
  // ... existing props
  userName,
  userId,
}) => {
  return (
    {paginatedArchives.map((archive) =>
      archive.code === "PERSONAL" ? (
        <PersonalArchiveCard
          key={archive.id}
          archive={archive}
          onClick={() => onArchiveClick(archive.id)}
          userName={userName}  // ✅ Pass to child
          userId={userId}      // ✅ Pass to child
        />
      ) : (
        <ArchiveCard ... />
      )
    )}
  );
};
```

### 3. **DocumentView Component**

**File:** `src/app/dashboard/siadil/components/views/DocumentView.tsx`

**Updated:** (Same pattern as ArchiveView)

```tsx
interface DocumentViewProps {
  // ... existing props
  userName?: string;    // ✅ NEW
  userId?: string;      // ✅ NEW
}

const DocumentView: React.FC<DocumentViewProps> = ({
  // ... existing props
  userName,
  userId,
}) => {
  // In sub-archives section:
  {archives.map((archive) =>
    archive.code === "PERSONAL" ? (
      <PersonalArchiveCard
        key={archive.id}
        archive={archive}
        onClick={() => onArchiveClick(archive.id)}
        userName={userName}  // ✅ Pass to child
        userId={userId}      // ✅ Pass to child
      />
    ) : (
      <ArchiveCard ... />
    )
  )}
};
```

### 4. **Main SIADIL Page**

**File:** `src/app/dashboard/siadil/page.tsx`

**Already has session data:**

```tsx
export default function SiadilPage() {
  const { data: session } = useSession(); // ✅ Get session from API

  const userData = {
    name: session?.user?.name || "Guest",
    id: session?.user?.username || session?.user?.id || "000000",
  };

  // Pass to ArchiveView
  <ArchiveView
    archives={archives.filter((a) => a.parentId === "root")}
    archiveDocCounts={archiveDocCounts}
    onArchiveClick={setCurrentFolderId}
    searchQuery={archiveSearchQuery}
    onArchiveMenuClick={handleArchiveMenuClick}
    userName={userData.name}  // ✅ Pass session data
    userId={userData.id}      // ✅ Pass session data
  />

  // Pass to DocumentView
  <DocumentView
    archives={subfolderArchives}
    // ... many other props
    userName={userData.name}  // ✅ Pass session data
    userId={userData.id}      // ✅ Pass session data
  />
}
```

## 🔄 Data Flow

```
API Login (SSO)
    ↓
NextAuth Session
    ↓
page.tsx: const { data: session } = useSession()
    ↓
userData = {
  name: session?.user?.name,    // e.g., "Dede Firmansyah"
  id: session?.user?.username   // e.g., "10122059"
}
    ↓
ArchiveView / DocumentView
    ↓
PersonalArchiveCard
    ↓
Display:
  - Initials: "DF" (from "Dede Firmansyah")
  - User ID: "10122059"
```

## 🎨 Visual Result

**Personal Card akan menampilkan:**

- **Initials Circle:** Inisial nama user dari API (contoh: "DF" dari "Dede Firmansyah")
- **User ID:** ID user dari API (contoh: "10122059")
- **Archive Name:** "Personal" (from archive.name)

## 📝 Notes

1. **Initials Logic:**

   - Single word name: First 2 characters (e.g., "Admin" → "AD")
   - Multiple words: First + Last word (e.g., "Dede Firmansyah" → "DF")
   - No name: "??" (fallback)

2. **Fallback Values:**

   - If `userName` is undefined: Shows "??"
   - If `userId` is undefined: Shows "N/A"

3. **Where It Appears:**
   - Main archives view (root level)
   - Sub-archives view (inside folders)

## ✅ Testing

**Mock Mode (NEXT_PUBLIC_USE_MOCK_AUTH=true):**

```
Login: admin / admin123
Expected Result:
  - Initials: "AD"
  - User ID: "admin123"
```

**Real API Mode:**

```
Login with actual SSO credentials
Expected Result:
  - Initials: From actual user name
  - User ID: From actual user ID
```

## 🚀 Status

✅ **COMPLETE** - Card Personal sekarang 100% dynamic menggunakan data dari API session!
