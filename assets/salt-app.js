const rawBase = globalThis.SALT_THEME_ASSET_BASE || new URL("./", import.meta.url).href;
const base = rawBase.startsWith("//") ? window.location.protocol + rawBase : rawBase;
import(new URL("salt-entry-632e69a11317.js", base).href);
