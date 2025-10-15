"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FolderIcon } from "../ui/FolderIcon";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";

// Definisikan tipe data di sini
interface BreadcrumbItem {
  label: string;
  id: string;
}

interface ModernHeaderProps {
  userName: string;
  userPhoto?: string;
  breadcrumbItems: BreadcrumbItem[];
  onBreadcrumbClick: (id: string) => void;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  userName,
  userPhoto,
  breadcrumbItems,
  onBreadcrumbClick,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const bannerRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // State dan Ref untuk dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Hook untuk menutup dropdown saat klik di luar
  useOnClickOutside(
    dropdownContainerRef,
    () => setIsDropdownOpen(false),
    dropdownButtonRef
  );

  // Efek untuk waktu dan sorotan mouse
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleMouseMove = (e: MouseEvent) => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        bannerRef.current.style.setProperty("--mouse-x", `${x}px`);
        bannerRef.current.style.setProperty("--mouse-y", `${y}px`);
      }
    };
    const currentBanner = bannerRef.current;
    currentBanner?.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearInterval(timer);
      currentBanner?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const formattedTime = currentTime
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ":");

  // Function to get dynamic greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  // Logika untuk item breadcrumb
  const dropdownItems = breadcrumbItems.slice(0, -1);
  const currentItem = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <div ref={bannerRef} className="group relative w-full">
      {/* Animated gradient hover effect */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(800px at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1), transparent 70%)",
        }}
      />

      {/* Main card with decorative elements */}
      <div className="relative w-full overflow-hidden rounded-2xl border-2 border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl dark:hover:shadow-emerald-500/10 transition-all duration-300">
        {/* Decorative background patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60 dark:from-emerald-950/20 dark:via-gray-900 dark:to-teal-950/20"></div>

        {/* Animated floating shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 dark:from-emerald-600/10 dark:to-teal-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 dark:from-teal-600/10 dark:to-emerald-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Decorative dots pattern */}
        <div className="absolute top-4 left-4 grid grid-cols-3 gap-1 opacity-20 dark:opacity-10">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
            ></div>
          ))}
        </div>

        {/* Content wrapper - optimized compact padding */}
        <div className="relative z-10 px-8 py-4">
          <div className="flex justify-between items-center gap-8">
            {/* Left section - User info with larger text and breadcrumb */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {/* Compact avatar with ring */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 animate-pulse"></div>
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white dark:ring-gray-800 overflow-hidden">
                    {userPhoto && !imageError ? (
                      <Image
                        src={userPhoto}
                        alt={userName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Welcome back to Siadil Dashboard
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate mt-0.5">
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {getGreeting()},
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {userName}
                    </span>
                  </h1>

                  {/* Breadcrumb section - compact design */}
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-1 rounded-md bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 px-2 py-1 shadow-sm">
                      {dropdownItems.length > 0 && (
                        <>
                          <button
                            ref={dropdownButtonRef}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-center rounded px-1.5 py-0.5 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
                            title="Lihat Navigasi"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 12h.01M12 12h.01M19 12h.01"
                              />
                            </svg>
                          </button>
                          <svg
                            className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      )}

                      <DropdownMenu
                        isOpen={isDropdownOpen}
                        items={dropdownItems}
                        triggerRef={dropdownButtonRef}
                        containerRef={dropdownContainerRef}
                        onItemClick={(id) => {
                          onBreadcrumbClick(id);
                          setIsDropdownOpen(false);
                        }}
                      />

                      {currentItem && (
                        <div className="flex items-center gap-1 rounded px-2 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                          <FolderIcon className="text-emerald-600 dark:text-emerald-400" />
                          <span
                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 whitespace-nowrap"
                            title={currentItem.label}
                          >
                            {currentItem.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right section - Time and date compact */}
            <div className="text-right flex-shrink-0 flex items-center gap-3">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg px-4 py-2.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-end gap-2 mb-1">
                  <svg
                    className="w-5 h-5 text-emerald-500 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight tabular-nums">
                    {formattedTime}
                  </p>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {currentTime.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated bottom accent line with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-600 animate-pulse"></div>

        {/* Corner decorations */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-emerald-200/50 dark:border-emerald-700/30 rounded-tr-2xl"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-teal-200/50 dark:border-teal-700/30 rounded-bl-2xl"></div>
      </div>
    </div>
  );
};

// --- KOMPONEN DROPDOWN MENU MODERN WHITE WITH LARGER TEXT ---
const DropdownMenu = ({
  isOpen,
  items,
  triggerRef,
  containerRef,
  onItemClick,
}: {
  isOpen: boolean;
  items: BreadcrumbItem[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onItemClick: (id: string) => void;
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: 200,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        animation: "scale-in 0.1s ease-out forwards",
        zIndex: 50,
      }}
      className="origin-top-left rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1"
    >
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onItemClick(item.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-150"
            >
              <FolderIcon className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="truncate flex-1">{item.label}</span>
              <svg
                className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
};

export default ModernHeader;
