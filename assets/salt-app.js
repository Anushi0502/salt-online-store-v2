const rawBase = globalThis.SALT_THEME_ASSET_BASE || new URL("./", import.meta.url).href;
const base = rawBase.startsWith("//") ? window.location.protocol + rawBase : rawBase;
import(new URL("salt-entry-18a52013f129.js", base).href);
