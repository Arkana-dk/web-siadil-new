"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Shield,
  Lock,
  User,
  FileText,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fix hydration: Generate particles positions only once
  const particles = useMemo(
    () =>
      [...Array(15)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 12,
      })),
    []
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        router.push("/dashboard/siadil");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* LEFT SIDE - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-teal-300/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Title */}
          <div className="space-y-4 mb-12">
            <h1 className="text-6xl font-bold leading-tight">SIADIL</h1>
            <p className="text-2xl text-white/90 font-light">
              Sistem Arsip Digital
            </p>
            <p className="text-white/70 text-lg max-w-md leading-relaxed">
              Platform manajemen dokumen modern untuk efisiensi organisasi Anda
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: FileText, text: "Manajemen Dokumen Digital" },
              { icon: Shield, text: "Keamanan Data Terjamin" },
              { icon: Zap, text: "Akses Cepat & Real-time" },
              { icon: CheckCircle2, text: "Kolaborasi Tim Efektif" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 text-white/90 group hover:text-white transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-base">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-12">
            <p className="text-white/60 text-sm">
              © 2025 SIADIL - PT Pupuk Kujang (Demplon)
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative overflow-hidden -ml-1">
        {/* Mobile Background - Only visible on small screens */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 opacity-10"></div>

        {/* Soft Left Edge Shadow */}
        <div className="hidden lg:block absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>

        {/* Decorative Elements */}
        <div className="hidden lg:block absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-30 -mr-48 -mt-48"></div>
        <div className="hidden lg:block absolute bottom-0 left-0 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-30 -ml-40 -mb-40"></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10 space-y-6 border border-gray-100">
            {/* Header */}
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Selamat Datang
              </h2>
              <p className="text-gray-600">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-shake bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                    placeholder="Masukkan username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-gray-400 text-gray-900"
                    placeholder="Masukkan password"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all z-10"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/50 transition-all duration-300"></div>
                <div className="relative px-6 py-4 text-white font-semibold rounded-xl flex items-center justify-center gap-2.5">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-100">
              <p className="text-center text-xs text-gray-500">
                © 2025 SIADIL - PT Pupuk Kujang (Demplon)
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Shield className="w-3 h-3 text-gray-400" />
                <p className="text-center text-xs text-gray-400">
                  Protected & Encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Tech Stack Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Powered by{" "}
              <span className="font-semibold text-emerald-600">Next.js</span> &{" "}
              <span className="font-semibold text-emerald-600">NextAuth</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
