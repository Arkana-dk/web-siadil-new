"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SiadilHeader from "@/components/SiadilHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // logika pendeteksi scroll
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = contentRef.current;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden transition-colors duration-300">
      <div
        className={`sticky top-0 h-full transition-all duration-300 shrink-0 ${
          isSidebarCollapsed ? "w-20" : "w-60"
        }`}
      >
        <Sidebar onCollapseChange={setIsSidebarCollapsed} />
      </div>
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
        <SiadilHeader />
        <div
          ref={contentRef}
          className={`p-6 flex-1 overflow-y-auto custom-scrollbar ${
            isScrolling ? "scrolling" : ""
          }`}
        >
          <div className="max-w-screen-2xl mx-auto w-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
