const rawBase = globalThis.SALT_THEME_ASSET_BASE || new URL("./", import.meta.url).href;
const base = rawBase.startsWith("//") ? window.location.protocol + rawBase : rawBase;
import(new URL("salt-entry-46f15f91b8f4.js", base).href);
