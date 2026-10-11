import { afterEach, describe, expect, it, vi } from "vitest";
import { ariaShortcut, formatShortcut } from "./shortcuts";

afterEach(() => vi.unstubAllGlobals());

describe("shortcut labels", () => {
  it("lists modifiers in canonical order", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    expect(formatShortcut("L", [])).toBe("L");
    expect(formatShortcut("L", ["shift", "alt", "ctrl"])).toBe("Ctrl+Alt+Shift+L");
    expect(ariaShortcut("F", ["meta", "ctrl"])).toBe("Control+Meta+F");
  });

  it("uses macOS symbols on Apple platforms", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
    expect(formatShortcut("L", ["meta", "alt", "ctrl"])).toBe("⌃⌥⌘L");
  });
});
