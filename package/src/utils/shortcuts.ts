export type ShortcutModifier = "ctrl" | "alt" | "shift" | "meta";

export const NO_SHORTCUT_MODIFIERS: readonly ShortcutModifier[] = [];

// Canonical display order (matches macOS menus: ⌃⌥⇧⌘)
const ORDER = ["ctrl", "alt", "shift", "meta"] as const;
const FLAG = { ctrl: "ctrlKey", alt: "altKey", shift: "shiftKey", meta: "metaKey" } as const;
const MAC = { ctrl: "⌃", alt: "⌥", shift: "⇧", meta: "⌘" };
const TEXT = { ctrl: "Ctrl", alt: "Alt", shift: "Shift", meta: "Meta" };
const ARIA = { ctrl: "Control", alt: "Alt", shift: "Shift", meta: "Meta" };

/** True when exactly the listed modifiers are held. */
export function hasExactModifiers(e: KeyboardEvent, mods: readonly ShortcutModifier[]): boolean {
  return ORDER.every((m) => e[FLAG[m]] === mods.includes(m));
}

/** Lowercased key. With Alt held, uses the physical key because macOS Option rewrites `key` (Option+L = "¬"). */
export function shortcutKey(e: KeyboardEvent): string {
  return (e.altKey && /^Key[A-Z]$/.test(e.code) ? e.code.slice(3) : e.key || "").toLowerCase();
}

const isMac = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || "");

/** Display label, e.g. "⌃⌥L" on macOS or "Ctrl+Alt+L" elsewhere. */
export function formatShortcut(key: string, mods: readonly ShortcutModifier[]): string {
  const used = ORDER.filter((m) => mods.includes(m));
  return isMac()
    ? used.map((m) => MAC[m]).join("") + key
    : [...used.map((m) => TEXT[m]), key].join("+");
}

/** Value for `aria-keyshortcuts`, e.g. "Control+Alt+F". */
export function ariaShortcut(key: string, mods: readonly ShortcutModifier[]): string {
  return [...ORDER.filter((m) => mods.includes(m)).map((m) => ARIA[m]), key].join("+");
}
