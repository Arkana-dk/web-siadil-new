/**
 * CONTOH IMPLEMENTASI: Menggunakan Real Archives API
 *
 * File ini menunjukkan cara menggunakan getArchivesFromAPI()
 * di dalam React component
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getArchivesFromAPI } from "@/app/dashboard/siadil/data";
import { Archive } from "@/app/dashboard/siadil/types";

export default function ArchivesExample() {
  const { data: session } = useSession();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArchives() {
      try {
        setLoading(true);
        setError(null);

        // Cek apakah user sudah login dan punya access token
        if (!session?.accessToken) {
          console.log("⏳ Waiting for session...");
          return;
        }

        console.log("🔄 Loading archives from API...");

        // Panggil API dengan access token dari session
        const data = await getArchivesFromAPI(session.accessToken);

        console.log(`✅ Loaded ${data.length} archives`);
        setArchives(data);
      } catch (err) {
        console.error("❌ Failed to load archives:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadArchives();
  }, [session?.accessToken]); // Re-fetch jika token berubah

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <p>Loading archives...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
        <p className="text-sm text-gray-500 mt-2">
          Menggunakan dummy data sebagai fallback.
        </p>
      </div>
    );
  }

  // Success state
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Archives</h2>
      <p className="text-sm text-gray-600 mb-4">
        Total: {archives.length} archives
      </p>

      <div className="grid gap-4">
        {archives.map((archive) => (
          <div
            key={archive.id}
            className="border p-4 rounded-lg hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{archive.name}</h3>
                <p className="text-sm text-gray-500">Code: {archive.code}</p>
                <p className="text-xs text-gray-400">ID: {archive.id}</p>
              </div>
              {archive.status && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    archive.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {archive.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
        <h4 className="font-semibold mb-2">Debug Info:</h4>
        <p>
          Session Token: {session?.accessToken ? "✅ Available" : "❌ Missing"}
        </p>
        <p>Archives Count: {archives.length}</p>
        <p>User: {session?.user?.name || "N/A"}</p>
      </div>
    </div>
  );
}
