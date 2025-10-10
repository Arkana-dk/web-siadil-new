"use client";

interface ApiErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
}

/**
 * Component untuk menampilkan error dari API dengan informasi yang jelas
 */
export function ApiErrorDisplay({ error, onRetry }: ApiErrorDisplayProps) {
  if (!error) return null;

  const getErrorType = (message: string) => {
    if (message.includes("403") || message.includes("Forbidden")) {
      return {
        title: "Access Denied (403 Forbidden)",
        icon: "🔒",
        color: "red",
        description: "You don't have permission to access this resource.",
        suggestions: [
          "Check if your account has the required permissions",
          "Contact your administrator to grant access",
          "Verify that the API token has proper authorization",
        ],
      };
    }

    if (message.includes("401") || message.includes("Unauthorized")) {
      return {
        title: "Authentication Required (401 Unauthorized)",
        icon: "🔑",
        color: "orange",
        description: "Your session may have expired or is invalid.",
        suggestions: [
          "Try logging out and logging in again",
          "Check if your access token is still valid",
          "Refresh the page and try again",
        ],
      };
    }

    if (message.includes("404") || message.includes("Not Found")) {
      return {
        title: "Resource Not Found (404)",
        icon: "🔍",
        color: "yellow",
        description: "The requested API endpoint could not be found.",
        suggestions: [
          "Verify the API endpoint URL is correct",
          "Check if the API service is running",
          "Contact the backend team to verify the endpoint",
        ],
      };
    }

    if (message.includes("fetch") || message.includes("network")) {
      return {
        title: "Network Error",
        icon: "📡",
        color: "purple",
        description: "Unable to connect to the API server.",
        suggestions: [
          "Check your internet connection",
          "Verify VPN connection if required",
          "Check if the API server is accessible",
        ],
      };
    }

    return {
      title: "API Error",
      icon: "⚠️",
      color: "gray",
      description: "An error occurred while fetching data from the API.",
      suggestions: [
        "Try refreshing the page",
        "Check the browser console for more details",
        "Contact support if the problem persists",
      ],
    };
  };

  const errorInfo = getErrorType(error.message);
  const colorClasses = {
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    gray: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800",
  };

  return (
    <div
      className={`rounded-lg border-2 p-6 ${
        colorClasses[errorInfo.color as keyof typeof colorClasses]
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-4xl flex-shrink-0">{errorInfo.icon}</div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {errorInfo.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {errorInfo.description}
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-md p-3 mb-4">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💡 Suggestions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-demplon text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              🔄 Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
