"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

const SiadilHeader = () => {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // SIMPLE & SMOOTH Toggle - Clean transition without scrollbar issue
  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      const newMode = !isDarkMode;

      // Add transition class to body only
      document.body.classList.add("theme-transitioning");

      // Apply theme change immediately - CSS handles smooth transition
      setIsDarkMode(newMode);

      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        document.body.classList.remove("theme-transitioning");
      }, 450); // 400ms transition + 50ms buffer
    }
  };

  // Auto load theme dari localStorage saat pertama render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark = saved === "dark" || (!saved && systemDark);

      setIsDarkMode(shouldBeDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  return (
    <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-2 transition-colors duration-300">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          {/* Search Command Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search command..."
              className="pl-4 pr-12 py-1 border border-gray-300 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent w-64 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <kbd className="inline-flex items-center border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 rounded px-2 text-xs font-sans font-normal text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <span className="text-xs">⌘</span>
                <span className="text-xs ml-1">K</span>
              </kbd>
            </div>
          </div>

          {/* Notification Bell Icon */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none transition-colors duration-200">
            {/* Efek ping */}
            <span className="ping-notif"></span>
            {/* Bulatan hijau tetap */}
            <span className="bg-[#01793B] absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-black transition-colors duration-300"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-900 dark:text-gray-100 transition-colors duration-300"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* Avatar - Dynamic from session (MOVED TO LEFT) */}
          <div className="relative group">
            {session?.user ? (
              <>
                {session.user.pic ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300 cursor-pointer hover:border-green-500 dark:hover:border-green-400">
                    <Image
                      src={session.user.pic}
                      alt={session.user.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:scale-110 hover:border-green-400">
                    <span className="text-white font-semibold text-xs">
                      {session.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)}
                    </span>
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 z-50 min-w-[200px] border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-2">
                    {session.user.pic ? (
                      <Image
                        src={session.user.pic}
                        alt={session.user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {session.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:!text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:!text-gray-200">
                        {session.user.username}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <p className="text-xs text-gray-600 dark:!text-gray-200">
                      <span className="font-medium dark:!text-white">
                        Organization:
                      </span>{" "}
                      {session.user.organization?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            )}
          </div>

          {/* 🌓 Compact Dark Mode Toggle with Ripple Effect (MOVED TO RIGHT) */}
          <button
            onClick={toggleDarkMode}
            className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-indigo-600 dark:to-purple-700 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-black transition-all duration-300 ease-in-out group overflow-hidden shadow-sm hover:shadow-md"
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {/* Sun Icon (Light Mode) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute inset-0 m-auto w-4 h-4 transition-all duration-500 ease-in-out ${
                isDarkMode
                  ? "opacity-0 scale-0 rotate-180"
                  : "opacity-100 scale-100 rotate-0 text-yellow-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707"
              />
              <circle cx="12" cy="12" r="4" strokeWidth={2.5} />
            </svg>

            {/* Moon Icon (Dark Mode) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`absolute inset-0 m-auto w-4 h-4 transition-all duration-500 ease-in-out ${
                isDarkMode
                  ? "opacity-100 scale-100 rotate-0 text-indigo-100"
                  : "opacity-0 scale-0 -rotate-180"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>

            {/* Glow effect on hover */}
            <div
              className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                isDarkMode ? "bg-white" : "bg-yellow-400"
              }`}
            ></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiadilHeader;
