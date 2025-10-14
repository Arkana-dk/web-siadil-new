/**
 * DEVELOPMENT HELPER - Clear Archives Cache
 *
 * Run this in browser console untuk force refresh archives dari API:
 *
 * 1. Open Browser Console (F12)
 * 2. Copy-paste code ini:
 *
 * localStorage.removeItem('siadil_archives_storage');
 * localStorage.removeItem('siadil_archives_fetched');
 * location.reload();
 *
 * 3. Page akan reload dan fetch ulang dari API
 */

// Function untuk clear cache (bisa dipanggil dari console)
window.clearArchivesCache = function () {
  console.log("🗑️ Clearing archives cache...");
  localStorage.removeItem("siadil_archives_storage");
  localStorage.removeItem("siadil_archives_fetched");
  console.log("✅ Cache cleared!");
  console.log("🔄 Reloading page...");
  location.reload();
};

console.log(
  "💡 TIP: Run clearArchivesCache() in console to force refresh from API"
);
