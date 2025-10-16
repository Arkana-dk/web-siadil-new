# 🎯 Contoh Praktis: Menggunakan Access Token untuk API Calls

## 📋 Skenario Real-World

Berikut adalah contoh-contoh praktis bagaimana menggunakan access token yang sudah tersimpan di session untuk berbagai keperluan API.

---

## 1️⃣ Fetch Documents dari API

### **Scenario:** Ambil daftar dokumen dari backend API

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface Document {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function DocumentList() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      // Pastikan ada access token
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        // API call dengan token
        const data = await apiGet<Document[]>(
          "/api/documents",
          session.accessToken
        );

        setDocuments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [session?.accessToken]);

  if (loading) return <div>Loading documents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Documents ({documents.length})</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 2️⃣ Create New Document

### **Scenario:** Upload dokumen baru ke backend

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

export default function CreateDocumentForm() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast.error("Not authenticated");
      return;
    }

    setSubmitting(true);

    try {
      const newDocument = {
        title,
        description,
        createdBy: session.user.username,
      };

      const result = await apiPost(
        "/api/documents",
        session.accessToken,
        newDocument
      );

      toast.success("Document created successfully!");
      console.log("Created document:", result);

      // Reset form
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? "Creating..." : "Create Document"}
      </button>
    </form>
  );
}
```

---

## 3️⃣ Upload File dengan Access Token

### **Scenario:** Upload file PDF/dokumen ke backend

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { apiUploadFile } from "@/lib/api";
import { toast } from "sonner";

export default function FileUploader() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !session?.accessToken) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);

    try {
      // Buat FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      formData.append("uploadedBy", session.user.username);
      formData.append("archiveId", "archive-123");

      // Upload dengan token
      const result = await apiUploadFile(
        "/api/documents/upload",
        session.accessToken,
        formData
      );

      toast.success("File uploaded successfully!");
      console.log("Upload result:", result);

      // Reset
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">Select File</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.png"
          className="block w-full"
        />
      </div>

      {file && (
        <div className="text-sm text-gray-600">
          Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>
    </div>
  );
}
```

---

## 4️⃣ Protected API Route (Server-Side)

### **Scenario:** Buat API route yang memerlukan authentication

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Forward request ke backend API dengan token
    const response = await fetch(
      "https://api.pupuk-kujang.co.id/demplon/documents",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Forward POST request dengan token
    const response = await fetch(
      "https://api.pupuk-kujang.co.id/demplon/documents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
```

---

## 5️⃣ Custom Hook untuk API Calls

### **Scenario:** Buat reusable hook untuk fetch data dengan token

```typescript
// hooks/useApiData.ts
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export function useApiData<T>(endpoint: string) {
  const { data: session } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const result = await apiGet<T>(endpoint, session.accessToken);
        setData(result);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, session?.accessToken]);

  const refetch = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const result = await apiGet<T>(endpoint, session.accessToken);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

// Usage:
// const { data: documents, loading, error, refetch } = useApiData<Document[]>("/api/documents");
```

---

## 6️⃣ Middleware untuk Token Validation

### **Scenario:** Validasi token di semua request ke dashboard

```typescript
// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Check if token exists
    if (!token?.accessToken) {
      console.warn("No access token in session");
    }

    // Check if token expired (jika backend return exp)
    // if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
    //   return NextResponse.redirect(new URL("/login", req.url));
    // }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 7️⃣ Error Handling & Token Expiration

### **Scenario:** Handle token expired dan auto-redirect to login

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

export function useProtectedApiCall() {
  const { data: session } = useSession();

  const protectedApiCall = async <T,>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    if (!session?.accessToken) {
      throw new Error("No access token available");
    }

    try {
      const data = await apiGet<T>(endpoint, session.accessToken);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        // Token expired atau invalid
        if (
          error.message.includes("401") ||
          error.message.includes("Unauthorized")
        ) {
          toast.error("Session expired. Please login again.");

          // Redirect to login
          setTimeout(() => {
            signOut({ callbackUrl: "/login" });
          }, 1500);
        }
        // Forbidden
        else if (error.message.includes("403")) {
          toast.error("You don't have permission to access this resource");
        }
        // Other errors
        else {
          toast.error(`API Error: ${error.message}`);
        }
      }
      throw error;
    }
  };

  return { protectedApiCall };
}

// Usage:
// const { protectedApiCall } = useProtectedApiCall();
// const data = await protectedApiCall<Document[]>("/api/documents");
```

---

## 8️⃣ Check Token di Browser Console

### **Quick Debug Script**

Paste di browser console untuk cek token:

```javascript
// Get session from localStorage/sessionStorage
const sessionToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("next-auth.session-token="))
  ?.split("=")[1];

console.log(
  "Session Token (httpOnly):",
  sessionToken ? "✅ Exists" : "❌ Not found"
);

// Decode JWT (jika bukan httpOnly - untuk testing)
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

// Test API dengan token (pastikan session sudah login)
async function testApiWithToken() {
  const response = await fetch("/api/auth/session");
  const session = await response.json();

  console.log("📦 Session:", session);
  console.log("🔑 Access Token:", session.accessToken);

  if (session.accessToken) {
    const decoded = decodeJWT(session.accessToken);
    console.log("🔓 Decoded Token:", decoded);
  }
}

testApiWithToken();
```

---

## 📊 Summary

| Use Case        | Function             | Example                |
| --------------- | -------------------- | ---------------------- |
| **GET data**    | `apiGet()`           | Fetch documents list   |
| **POST data**   | `apiPost()`          | Create new document    |
| **PUT data**    | `apiPut()`           | Update document        |
| **DELETE data** | `apiDelete()`        | Delete document        |
| **Upload file** | `apiUploadFile()`    | Upload PDF/image       |
| **Server API**  | `getServerSession()` | Protected API routes   |
| **Custom hook** | `useApiData()`       | Reusable data fetching |

---

**File ini:** `ACCESS_TOKEN_EXAMPLES.md`

Sudah ada 8 contoh praktis untuk berbagai skenario! 🚀
