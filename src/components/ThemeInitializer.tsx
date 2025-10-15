"use client";
import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme on client side immediately
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const shouldBeDark = saved === "dark" || (!saved && systemDark);

      if (shouldBeDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  return null;
}
