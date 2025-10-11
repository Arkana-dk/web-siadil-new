"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface APITestResult {
  testName: string;
  success: boolean;
  dataCount: number;
  metadata?: Record<string, unknown>;
  preview?: string;
  timestamp: string;
}

export function APIDebugPanel() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<APITestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string>("");
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("debugPanel_visible");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem("debugPanel_visible", String(isVisible));
  }, [isVisible]);

  const testAPI = async (testName: string, endpoint: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveTest(testName);

    try {
      console.log(`API Test: ${testName} -> ${endpoint}`);
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || `HTTP ${response.status}`
        );
      }

      let dataCount = 0;
      let preview = "";
      const metadata: Record<string, unknown> = {};

      if (Array.isArray(data.data)) {
        dataCount = data.data.length;
        if (data.data.length > 0) {
          preview =
            JSON.stringify(data.data[0], null, 2).substring(0, 200) + "...";
        }
      }

      if (data.recordsTotal !== undefined)
        metadata.recordsTotal = data.recordsTotal;
      if (data.recordsFiltered !== undefined)
        metadata.recordsFiltered = data.recordsFiltered;
      if (data.rootCount !== undefined) metadata.rootCount = data.rootCount;
      if (data.totalCount !== undefined) metadata.totalCount = data.totalCount;
      if (data.isTree !== undefined) metadata.isTree = data.isTree;

      setResult({
        testName,
        success: true,
        dataCount,
        metadata,
        preview,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      name: "Archives API",
      endpoint: "/api/test/archives",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      name: "Archives Tree API",
      endpoint: "/api/demplon/archives/tree?tree=true",
      color: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      name: "Documents API",
      endpoint: "/api/demplon/documents?length=10&reminder_active=false",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Latest Documents API",
      endpoint:
        "/api/demplon/documents/latest?start=0&length=10&sort[]=id&sortdir[]=DESC",
      color: "bg-cyan-600 hover:bg-cyan-700",
    },
  ];

  const handleClearCache = () => {
    localStorage.clear();
    alert("Cache cleared! Page akan reload.");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-lg border-2 border-demplon overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-demplon to-teal-700 text-white">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">API Testing Center</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                session?.accessToken ? "bg-green-500/80" : "bg-red-500/80"
              }`}
            >
              {session?.accessToken ? "OK" : "No Token"}
            </span>
          </div>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-md"
          >
            {isVisible ? "Hide" : "Show"}
          </button>
        </div>

        {isVisible && (
          <div className="p-4 max-h-[600px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {tests.map((test) => (
                <button
                  key={test.name}
                  onClick={() => testAPI(test.name, test.endpoint)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm ${test.color} text-white rounded disabled:bg-gray-300 font-semibold`}
                >
                  {loading && activeTest === test.name ? "..." : "Test"}{" "}
                  {test.name.replace(" API", "")}
                </button>
              ))}
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="px-3 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 font-semibold"
              >
                Clear Cache
              </button>
            </div>

            {result && (
              <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-green-700">
                    Success: {result.testName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString("id-ID")}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Data Count:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-mono">
                      {result.dataCount}
                    </span>
                  </div>
                  {result.metadata &&
                    Object.keys(result.metadata).length > 0 && (
                      <div className="bg-white p-2 rounded border">
                        <p className="text-xs font-semibold mb-1">Metadata:</p>
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <div
                            key={key}
                            className="text-xs flex justify-between"
                          >
                            <span>{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  {result.preview && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:underline">
                        View Preview
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto text-xs">
                        {result.preview}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-bold text-red-700 mb-2">
                  Failed: {activeTest}
                </p>
                <p className="text-sm font-mono">{error}</p>
              </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs">
              <p className="font-bold mb-2">Session Info</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={
                      session ? "text-green-600 font-semibold" : "text-red-600"
                    }
                  >
                    {session ? "Auth" : "No Auth"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="font-semibold">
                    {session?.user?.name || "Not logged in"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
