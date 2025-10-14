"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Reminder } from "../../types";
import { AddNewMenu } from "../ui/AddNewMenu";
import { removeDuplicateReminders } from "@/lib/filterDuplicates";

interface HeaderSectionProps {
  totalDocuments: number;
  expiredCount: number;
  expiringSoonCount: number;
  onViewAllReminders: () => void;
  addNewButtonRef: React.RefObject<HTMLDivElement | null>;
  isAddNewMenuOpen: boolean;
  onToggleAddNewMenu: () => void;
  onCloseAddNewMenu: () => void;
  onNewFolder: () => void;
  onFileUpload: () => void;
  currentFolderId: string;
  onExpiredCardClick: () => void;
  onExpiringSoonCardClick: () => void;
  reminders: Reminder[];
  onReminderClick?: (documentId: string) => void;
}

const InfoCard = ({
  gradient,
  icon,
  value,
  title,
  subtitle,
  onClick,
}: {
  gradient: string;
  icon: React.ReactNode;
  value: number;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const currentCard = cardRef.current;
      if (!currentCard) return;
      const rect = currentCard.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      currentCard.style.setProperty("--mouse-x", `${x}px`);
      currentCard.style.setProperty("--mouse-y", `${y}px`);
    };

    const currentCard = cardRef.current;
    currentCard?.addEventListener("mousemove", handleMouseMove);

    return () => {
      currentCard?.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative w-full ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Main card dengan efek modern */}
      <div
        className={`relative z-10 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:-translate-y-1 ${gradient}`}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* Content */}
        <div className="relative p-3 pb-1 pt-1 text-white">
          {/* Icon dengan efek 3D */}
          <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/30 backdrop-blur-sm shadow-lg ring-1 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white/40">
            {icon}
          </div>

          {/* Text content */}
          <div className="mt-7 p-2 pt-0">
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-base font-semibold mt-1 text-white">{title}</p>
            <p className="text-xs text-white opacity-80">{subtitle}</p>
          </div>

          {/* Bottom decorative bar dengan animasi */}
          <div className="mt-2 mb-1 mx-2 h-1 w-[calc(100%-1rem)] bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/50 rounded-full transform origin-left transition-transform duration-300 ease-out group-hover:scale-x-100 scale-x-0"></div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-tr-full transform -translate-x-10 translate-y-10 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0"></div>
      </div>
    </div>
  );
};

const HeaderSection: React.FC<HeaderSectionProps> = ({
  totalDocuments,
  expiredCount,
  expiringSoonCount,
  onViewAllReminders,
  addNewButtonRef,
  isAddNewMenuOpen,
  onToggleAddNewMenu,
  onCloseAddNewMenu,
  onNewFolder,
  onFileUpload,
  currentFolderId,
  onExpiredCardClick,
  onExpiringSoonCardClick,
  reminders,
  onReminderClick,
}) => {
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 Filter duplicate reminders by documentId
  const uniqueReminders = useMemo(() => {
    return removeDuplicateReminders(reminders, "documentId");
  }, [reminders]);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentReminderIndex((prev) => {
          const nextIndex = prev + 3;
          return nextIndex >= uniqueReminders.length ? 0 : nextIndex;
        });
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 500);
    }, 7000);
  }, [uniqueReminders.length]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (uniqueReminders.length > 3) {
      startInterval();
    }
    return () => stopInterval();
  }, [uniqueReminders.length, startInterval, stopInterval]);
  const getReminderStyles = (type: "error" | "warning" | undefined) => {
    switch (type) {
      case "error":
        return {
          bgColor: "bg-red-50 dark:bg-red-900/50",
          borderColor: "border-red-200 dark:border-red-700",
          accentColor: "bg-red-500",
          iconBg: "bg-red-100 dark:bg-red-900",
          iconColor: "text-red-600 dark:text-red-400",
          titleColor: "text-red-800 dark:text-red-200",
          icon: (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.636-1.026 2.85-1.026 3.486 0l5.58 8.998c.636 1.026-.234 2.403-1.743 2.403H4.42c-1.51 0-2.379-1.377-1.743-2.403l5.58-8.998zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      default:
        return {
          bgColor: "bg-yellow-50 dark:bg-yellow-900/50",
          borderColor: "border-yellow-200 dark:border-yellow-700",
          accentColor: "bg-yellow-500",
          iconBg: "bg-yellow-100 dark:bg-yellow-900",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          titleColor: "text-yellow-800 dark:text-yellow-200",
          icon: (
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };
  return (
    <div className="mb-2">
      <div className="flex flex-col lg:flex-row items-start justify-between">
        {/* === KOLOM KIRI === */}
        <div className="flex-1 w-full lg:mt-4">
          {/* Container Flex untuk Add New + Grid Cards */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            {/* Tombol "Add New" - Kecil & Menonjol di Kiri */}
            <div className="relative flex-shrink-0 sm:w-28">
              <div
                ref={addNewButtonRef}
                onClick={onToggleAddNewMenu}
                className="group relative h-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-demplon via-teal-600 to-emerald-600 p-[2px] shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-demplon/40 hover:scale-105 active:scale-95"
              >
                {/* Efek shimmer/glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Inner content */}
                <div className="relative h-full flex flex-col items-center justify-center gap-2.5 rounded-[10px] bg-white dark:bg-gray-900 px-3 py-4 transition-all duration-300">
                  {/* Icon dengan animasi */}
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-demplon to-teal-500 text-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-demplon/50 group-hover:rotate-90">
                    <svg
                      className="h-7 w-7 transition-transform duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m6-6H6"
                      />
                    </svg>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 rounded-lg bg-demplon opacity-0 group-hover:opacity-30 group-hover:animate-ping"></div>
                  </div>

                  {/* Text - Lebih Besar & Jelas untuk Lansia */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                      Add
                    </span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide">
                      New
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu dropdown */}
              {isAddNewMenuOpen && (
                <AddNewMenu
                  buttonRef={addNewButtonRef}
                  onClose={onCloseAddNewMenu}
                  onNewFolder={onNewFolder}
                  onFileUpload={onFileUpload}
                  context={
                    currentFolderId === "root" ? "archives" : "documents"
                  }
                />
              )}
            </div>

            {/* Grid Cards - 3 kolom untuk info cards */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                gradient="bg-gradient-to-br from-demplon to-teal-600"
                value={totalDocuments}
                title={currentFolderId === "root" ? "Documents" : "Documents"}
                subtitle={
                  currentFolderId === "root"
                    ? "All Active Documents"
                    : "This Folder & Subfolders"
                }
                icon={
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                }
              />
              <InfoCard
                gradient="bg-gradient-to-br from-red-700 to-red-500"
                value={expiredCount}
                title={currentFolderId === "root" ? "Expired" : "Expired Here"}
                subtitle={
                  currentFolderId === "root"
                    ? "Needs Immediate Attention"
                    : "In This Scope"
                }
                onClick={onExpiredCardClick}
                icon={
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <InfoCard
                gradient="bg-gradient-to-br from-yellow-600 to-yellow-500"
                value={expiringSoonCount}
                title={
                  currentFolderId === "root" ? "Will Expire" : "Expiring Soon"
                }
                subtitle={
                  currentFolderId === "root"
                    ? "In the next 30 days"
                    : "Next 30 days (scope)"
                }
                onClick={onExpiringSoonCardClick}
                icon={
                  <svg
                    className="h-6 w-6 text-white"
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
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* === REMINDERS SECTION === */}
      <div className="w-full mt-6 mb-6">
        <div className="flex w-full items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-demplon to-teal-600 shadow-md">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Reminders
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAllReminders}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-demplon hover:text-white hover:border-demplon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-demplon/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-demplon"
            aria-label="View all Reminders"
          >
            View All
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M9 5l7 7-7 7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-3"
          style={{
            overflow: "hidden",
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
          onMouseEnter={stopInterval}
          onMouseLeave={startInterval}
        >
          {uniqueReminders.length === 0 ? (
            <div className="col-span-3 relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-800/50 dark:to-gray-800 py-12">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-demplon"></div>
                <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-yellow-500"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-red-500"></div>
              </div>

              {/* Content */}
              <div className="relative flex flex-col items-center justify-center gap-4">
                {/* Icon with animation */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-demplon/20 to-teal-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-demplon/10 to-teal-500/10 ring-2 ring-demplon/20">
                    <svg
                      className="w-8 h-8 text-demplon"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                  <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Semua Dokumen Aman! 🎉
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    Tidak ada dokumen yang akan kedaluwarsa dalam waktu dekat.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Reminder akan muncul ketika ada dokumen yang perlu perhatian
                  </p>
                </div>

                {/* Decorative badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-demplon/5 border border-demplon/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-demplon opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-demplon"></span>
                  </span>
                  <span className="text-xs font-semibold text-demplon">
                    Status: Semua Terkendali
                  </span>
                </div>
              </div>
            </div>
          ) : (
            [0, 1, 2].map((cardIndex) => {
              const reminderIndex = currentReminderIndex + cardIndex;

              if (reminderIndex >= uniqueReminders.length) {
                return (
                  <div
                    key={`placeholder-${cardIndex}`}
                    className="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-3 h-24 flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      -
                    </span>
                  </div>
                );
              }

              const reminder = uniqueReminders[reminderIndex];
              if (!reminder) {
                return null;
              }
              const styles = getReminderStyles(reminder.type);

              const handleReminderClick = () => {
                if (onReminderClick && reminder.documentId) {
                  onReminderClick(reminder.documentId);
                }
              };

              return (
                <div
                  key={`${reminder.id}-${reminderIndex}`}
                  onClick={handleReminderClick}
                  className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow h-24 ${
                    reminder.documentId
                      ? "cursor-pointer hover:ring-2 hover:ring-demplon/0"
                      : "cursor-default"
                  } ${
                    isTransitioning
                      ? "animate-slide-out-left"
                      : "animate-slide-in-right"
                  }`}
                >
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 p-[1px] rounded-lg">
                    <div
                      className={`h-full w-full rounded-lg ${styles.bgColor} transition-all duration-200`}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                      {/* Accent bar dengan animasi */}
                      <div className="absolute left-0 top-0 w-1 h-full overflow-hidden rounded-l-lg">
                        <div
                          className={`w-full h-full ${styles.accentColor} transform origin-top transition-transform duration-200 group-hover:scale-y-105`}
                        ></div>
                      </div>

                      {/* Content */}
                      <div className="relative flex items-center gap-2.5 p-3 h-full">
                        {/* Icon dengan efek 3D */}
                        <div
                          className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconColor} shadow-md ring-1 ring-white/40 dark:ring-white/10 transition-all duration-200 group-hover:scale-105 group-hover:rotate-3`}
                        >
                          {styles.icon}
                        </div>

                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-extrabold truncate ${styles.titleColor} mb-1`}
                          >
                            {reminder.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1 font-medium">
                            {reminder.description}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 line-clamp-1 leading-relaxed">
                            {reminder.message}
                          </p>
                        </div>
                      </div>

                      {/* Bottom progress indicator */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5">
                        <div
                          className={`h-full ${styles.accentColor} transform origin-left transition-transform duration-200 group-hover:scale-x-100 scale-x-0`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
