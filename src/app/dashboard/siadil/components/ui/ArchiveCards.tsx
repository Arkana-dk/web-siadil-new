"use client";

import { Archive } from "../../types";
import Image from "next/image";
import { useState } from "react";

const PersonalArchiveCard = ({
  archive,
  onClick,
  userName,
  userId,
  userPhoto,
}: {
  archive: Archive;
  onClick: () => void;
  userName?: string;
  userId?: string;
  userPhoto?: string;
}) => {
  const [imageError, setImageError] = useState(false);

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
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-gradient-to-br from-demplon to-teal-600 p-5 text-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-[156px]"
    >
      <div className="absolute top-0 left-0 h-full w-full opacity-10">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 800"
        >
          <g fill="none" stroke="#FFF" strokeWidth="0.5">
            <path d="M-200,300 Q-100,250 0,300 t200,0 t200,0 t200,0 t200,0 t200,0" />
            <path d="M-200,350 Q-100,300 0,350 t200,0 t200,0 t200,0 t200,0 t200,0" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/50 overflow-hidden">
            {userPhoto && !imageError ? (
              <Image
                src={userPhoto}
                alt={userName || "User"}
                width={48}
                height={48}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xl font-bold tracking-wide text-white">
                {getInitials(userName)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-base font-bold text-white line-clamp-1"
              title={userName || archive.name}
            >
              {archive.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-green-100">
              {userId || "N/A"}
            </p>
          </div>
        </div>

        <span className="self-start rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          Personal
        </span>
      </div>
    </div>
  );
};

interface ArchiveCardProps {
  archive: Archive;
  docCount: number;
  onClick: () => void;
  onMenuClick?: (e: React.MouseEvent, archiveId: string) => void;
}

const ArchiveCard = ({
  archive,
  docCount,
  onClick,
  onMenuClick,
}: ArchiveCardProps) => {
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMenuClick) {
      onMenuClick(e, archive.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col items-start overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5 dark:border-gray-700 dark:bg-gray-900/50 h-[156px]"
    >
      {/* Three dots menu button - always visible */}
      {onMenuClick && (
        <button
          onClick={handleMenuClick}
          className="absolute top-2 right-2 z-10 flex items-center justify-center w-6 h-6 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      )}

      {/* Icon - Smaller and more compact */}
      <div className="mb-2.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </div>

      {/* Content wrapper - Fixed height untuk alignment */}
      <div className="flex flex-col flex-1 w-full justify-between">
        {/* Title - Maksimal 2 baris */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 w-full leading-tight pr-6">
          {archive.name}
        </h3>

        {/* Item count - Fixed position di bawah, sejajar */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {docCount} item{docCount !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

export { ArchiveCard, PersonalArchiveCard };
