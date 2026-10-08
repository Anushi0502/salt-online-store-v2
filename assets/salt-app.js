const saltPreloadRetryKey = "salt-vite-preload-retry";
const recoverFromPreloadError = () => {
  try {
    if (sessionStorage.getItem(saltPreloadRetryKey) === "1") return;
    sessionStorage.setItem(saltPreloadRetryKey, "1");
  } catch {}
  const retryUrl = new URL(window.location.href);
  retryUrl.searchParams.set("salt_asset_refresh", Date.now().toString(36));
  window.location.replace(retryUrl.href);
};
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  recoverFromPreloadError();
});
const rawBase = globalThis.SALT_THEME_ASSET_BASE || new URL("./", import.meta.url).href;
const base = rawBase.startsWith("//") ? window.location.protocol + rawBase : rawBase;
import(new URL("salt-entry-599494f71172.js", base).href)
  .then(() => {
    try {
      sessionStorage.removeItem(saltPreloadRetryKey);
    } catch {}
  })
  .catch(recoverFromPreloadError);
