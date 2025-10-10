"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getArchivesFromAPI } from "../../data";
import { getAccessTokenFromServer } from "@/lib/api";
import { Archive } from "../../types";

/**
 * Debug Panel Component
 * Component ini untuk testing API archives
 * Tampilkan di page untuk test fetch manual
 */
export function DebugArchivesPanel() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Archive[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved state dari localStorage
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("debugPanel_visible");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  // Save state ke localStorage ketika berubah
  useEffect(() => {
    localStorage.setItem("debugPanel_visible", String(isVisible));
  }, [isVisible]);

  const handleFetchArchives = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 DEBUG: Manual fetch triggered");
      console.log("🧪 DEBUG: Session:", session);
      console.log("🧪 DEBUG: Session Access Token:", session?.accessToken);

      if (!session) {
        throw new Error(
          "No session found. Please refresh the page and try again."
        );
      }

      // 🔥 NEW: Fetch token dari server-side API route
      console.log("🔑 Trying to get token from server API...");
      const tokenFromServer = await getAccessTokenFromServer();

      console.log(
        "🔑 Token from server API:",
        tokenFromServer ? "EXISTS ✅" : "NULL ❌"
      );

      const accessToken = tokenFromServer || session.accessToken;

      if (!accessToken) {
        throw new Error(
          "No access token available. Please logout and login again."
        );
      }

      console.log("🔑 Using token:", accessToken.substring(0, 30) + "...");

      const archives = await getArchivesFromAPI(accessToken);
      setResult(archives);
      console.log("✅ DEBUG: Fetch successful", archives);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("❌ DEBUG: Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🧪 TEST: Calling server-side test endpoint...");
      const response = await fetch("/api/test/archives");
      const data = await response.json();

      console.log("🧪 TEST: Response:", data);

      if (!data.success) {
        throw new Error(data.error || "Test failed");
      }

      setResult(data.data || []);
      console.log("✅ TEST: Success!", data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("❌ TEST: Failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem("siadil_archives_storage");
    localStorage.removeItem("siadil_archives_fetched");
    console.log("🗑️ Cache cleared");
    alert("Cache cleared! Page akan reload.");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border-2 border-demplon overflow-hidden">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-demplon to-teal-700 text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg">{isVisible ? "🐛" : "📦"}</span>
            <h3 className="text-sm font-bold">Debug Panel</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                session?.accessToken
                  ? "bg-green-500/80 text-white"
                  : "bg-red-500/80 text-white"
              }`}
            >
              {session?.accessToken ? "✓" : "✗"}
            </span>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="group flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-all hover:scale-105 font-medium"
            title={isVisible ? "Minimize (akan diingat)" : "Expand panel"}
          >
            <span className="transition-transform group-hover:scale-110">
              {isVisible ? "🙈" : "👁️"}
            </span>
            <span>{isVisible ? "Minimize" : "Show"}</span>
          </button>
        </div>

        {/* Collapsible Content */}
        {isVisible && (
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={handleTestAPI}
                disabled={loading}
                className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? "⏳ Testing..." : "🧪 TEST API (Server-Side)"}
              </button>

              <button
                onClick={handleFetchArchives}
                disabled={loading || !session?.accessToken}
                className="w-full px-3 py-2 text-sm bg-demplon text-white rounded hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? "⏳ Fetching..." : "📡 Fetch Archives (Client-Side)"}
              </button>

              <button
                onClick={handleClearCache}
                className="w-full px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                🗑️ Clear Cache & Reload
              </button>
            </div>

            {/* Result Display */}
            {result && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">
                  ✅ Success - DATA FROM API!
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  📡 {result.length} archives from company API
                </p>
                <div className="mt-2 text-xs">
                  <p className="text-green-600 dark:text-green-400 font-medium mb-1">
                    Codes: {result.map((a) => a.code).join(", ")}
                  </p>
                </div>
                <div className="mt-2 max-h-32 overflow-auto">
                  <pre className="text-xs text-gray-600 dark:text-gray-400">
                    {JSON.stringify(
                      result.map((a) => ({
                        id: a.id,
                        code: a.code,
                        name: a.name,
                      })),
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                <p className="font-semibold text-red-700 dark:text-red-400 mb-1">
                  ❌ Error!
                </p>
                <p className="text-gray-700 dark:text-gray-300">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-600 dark:text-gray-400">
              <p className="font-semibold mb-1">📝 Info:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Session: {session ? "✅" : "❌"}</li>
                <li>Token: {session?.accessToken ? "✅" : "❌"}</li>
                <li>User: {session?.user?.name || "Not logged in"}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
