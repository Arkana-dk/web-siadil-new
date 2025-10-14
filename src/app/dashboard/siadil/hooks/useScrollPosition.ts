import { useEffect, useRef } from "react";

/**
 * Hook untuk menyimpan dan restore posisi scroll
 * Berguna untuk mempertahankan posisi scroll ketika navigasi antar folder
 */
export function useScrollPosition(currentFolderId: string) {
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());
  const isRestoringRef = useRef(false);

  // Simpan posisi scroll saat ini sebelum berpindah folder
  const saveScrollPosition = (folderId: string) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    scrollPositionsRef.current.set(folderId, scrollY);
    console.log(`💾 Saved scroll position for folder ${folderId}:`, scrollY);
  };

  // Restore posisi scroll ketika kembali ke folder
  const restoreScrollPosition = (folderId: string) => {
    const savedPosition = scrollPositionsRef.current.get(folderId);
    if (savedPosition !== undefined) {
      isRestoringRef.current = true;
      console.log(
        `📍 Restoring scroll position for folder ${folderId}:`,
        savedPosition
      );

      // Tunggu sampai DOM selesai render
      requestAnimationFrame(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: "smooth",
        });

        // Reset flag setelah scroll selesai
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 500);
      });
    } else {
      console.log(
        `📍 No saved scroll position for folder ${folderId}, scrolling to top`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Simpan scroll position ketika folder berubah
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(currentFolderId);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentFolderId]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    scrollPositions: scrollPositionsRef.current,
  };
}
