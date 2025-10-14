import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// API Response Types
interface LoginSuccessResponse {
  success: true;
  application?: {
    id: number;
    slug: string;
    name: string;
    description: string;
    active: boolean;
  };
  roles?: string[];
  user: {
    id: string;
    username: string;
    name: string;
    pic: string;
    email: string;
    organization?: {
      id: string;
      name: string;
      leader: boolean;
    };
  };
  token?: string; // Access token dari API
  access_token?: string; // Alternative nama field untuk token
  accessToken?: string; // Alternative nama field untuk token
}

interface LoginErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development", // Enable debug logs in development
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password harus diisi");
        }

        // Call Real API
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "https://sso.pupuk-kujang.co.id";
          console.log("🔌 Attempting API login to:", apiUrl);

          const response = await fetch(`${apiUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
              application: "demplonadmin", // Required by SSO server
            }),
          });

          const data = await response.json();

          // Log raw response untuk debugging
          console.log("📦 Raw API Response:", JSON.stringify(data, null, 2));

          // Check if login failed
          if (!response.ok || !data.success) {
            const errorData = data as LoginErrorResponse;
            throw new Error(errorData.message || "Login gagal");
          }

          // Login success
          const loginData = data as LoginSuccessResponse;

          // Log untuk debugging
          console.log("✅ Login successful for user:", loginData.user.username);
          console.log(
            "🔑 Access token from API:",
            loginData.token ? "YES ✅" : "NO ❌"
          );

          // Cari token dari berbagai kemungkinan field
          const accessToken =
            loginData.token || loginData.access_token || loginData.accessToken;

          if (!accessToken) {
            console.error("❌ API did not return access token");
            throw new Error(
              "Login berhasil tapi server tidak mengembalikan access token. Hubungi administrator."
            );
          }

          console.log(
            "🔑 Token preview:",
            accessToken.substring(0, 50) + "..."
          );

          // Return user data sesuai dengan structure yang dibutuhkan
          return {
            id: loginData.user.id,
            username: loginData.user.username,
            name: loginData.user.name,
            email: loginData.user.email,
            pic: loginData.user.pic,
            roles: loginData.roles || [],
            organization: {
              id: loginData.user.organization?.id || "unknown",
              name: loginData.user.organization?.name || "Unknown Organization",
              leader: loginData.user.organization?.leader || false,
            },
            application: {
              id: loginData.application?.id || 1,
              slug: loginData.application?.slug || "siadil",
              name: loginData.application?.name || "SIADIL",
              description:
                loginData.application?.description || "Sistem Arsip Digital",
              active: loginData.application?.active || true,
            },
            accessToken: accessToken, // Simpan access token (dari API atau generated)
          };
        } catch (error) {
          console.error("❌ Login error:", error);

          // Berikan error message yang lebih jelas
          if (
            error instanceof TypeError &&
            error.message.includes("fetch failed")
          ) {
            throw new Error(
              "Tidak dapat terhubung ke server. Pastikan Anda terhubung ke jaringan internal atau VPN."
            );
          }

          if (error instanceof Error) {
            throw error;
          }
          throw new Error("Terjadi kesalahan saat login");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("📝 JWT Callback - Saving user data to token");
        console.log(
          "🔑 User accessToken:",
          user.accessToken ? "EXISTS ✅" : "MISSING ❌"
        );

        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.email = user.email;
        token.pic = user.pic;
        token.roles = user.roles;
        token.organization = user.organization;
        token.application = user.application;
        token.accessToken = user.accessToken; // Simpan access token di JWT

        console.log(
          "🔑 Token.accessToken after save:",
          token.accessToken ? "SAVED ✅" : "NOT SAVED ❌"
        );
      }
      return token;
    },
    async session({ session, token }) {
      console.log("📦 Session Callback - Building session");
      console.log(
        "🔑 Token.accessToken:",
        token.accessToken ? "EXISTS ✅" : "MISSING ❌"
      );

      if (token && session.user) {
        // ⚡ OPTIMIZED: Hanya include data essential untuk mengurangi ukuran cookie
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.pic = token.pic;
        // Simpan hanya nama roles, bukan full object
        session.user.roles = token.roles;
        // Simpan hanya nama organization
        if (token.organization && typeof token.organization === "object") {
          session.user.organization = {
            id: token.organization.id,
            name: token.organization.name,
            leader: token.organization.leader,
          };
        }
        // Skip application details (tidak terlalu penting untuk cookie)
        // session.user.application = token.application;

        // CRITICAL: accessToken tetap ada di session
        session.accessToken = token.accessToken;

        console.log(
          "🔑 Session.accessToken after save:",
          session.accessToken ? "SAVED ✅" : "NOT SAVED ❌"
        );
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
