import { parseHTML } from "linkedom";
import { afterEach, describe, expect, test, vi } from "vitest";

import ThemeToggle from "./ThemeToggle.astro";
import {
  applyTheme,
  applyThemeImmediately,
  cycleMode,
  getStoredMode,
  initThemeToggle,
  setStoredMode,
  updateThemeUI,
} from "./theme-toggle";
import { renderComponent } from "./test-utils";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function themeDocument(): Document {
  return parseHTML(`
    <html>
      <body>
        <button data-theme-toggle aria-label="Toggle theme"></button>
        <span data-theme-icon="system" class="hidden"></span>
        <span data-theme-icon="light" class="hidden"></span>
        <span data-theme-icon="dark" class="hidden"></span>
        <span data-tooltip-text="system" class="hidden"></span>
        <span data-tooltip-text="light" class="hidden"></span>
        <span data-tooltip-text="dark" class="hidden"></span>
      </body>
    </html>
  `).document;
}

function themeWindow(prefersDark = false) {
  const listeners: Array<() => void> = [];
  const win = {
    matchMedia: vi.fn(() => ({
      matches: prefersDark,
      addEventListener: vi.fn((_type: "change", listener: () => void) => {
        listeners.push(listener);
      }),
    })),
    requestAnimationFrame: vi.fn((callback: () => void) => {
      callback();
      return 1;
    }),
  };

  return { win, listeners };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  test("renders theme toggle controls and tooltip state containers", async () => {
    const document = await renderComponent(ThemeToggle);
    const button = document.querySelector("[data-theme-toggle]");
    const tooltip = document.querySelector('[role="tooltip"]');

    expect(button?.getAttribute("type")).toBe("button");
    expect(button?.getAttribute("aria-label")).toBe("Toggle theme");
    expect(button?.getAttribute("aria-describedby")).toBe(
      tooltip?.getAttribute("id"),
    );
    expect(tooltip?.classList.contains("group-hover:opacity-100")).toBe(true);
    expect(tooltip?.classList.contains("group-focus-within:opacity-100")).toBe(
      false,
    );
    expect(document.querySelectorAll("[data-theme-icon]")).toHaveLength(3);
    expect(document.querySelectorAll("[data-tooltip-text]")).toHaveLength(3);
  });
});

describe("theme-toggle helpers", () => {
  test("reads, writes, removes, and cycles stored modes", () => {
    const storage = new MemoryStorage();

    expect(getStoredMode(storage)).toBe("system");
    storage.setItem("theme", "invalid");
    expect(getStoredMode(storage)).toBe("system");

    setStoredMode(storage, "light");
    expect(getStoredMode(storage)).toBe("light");
    setStoredMode(storage, "system");
    expect(storage.getItem("theme")).toBeNull();

    expect(cycleMode("system")).toBe("light");
    expect(cycleMode("light")).toBe("dark");
    expect(cycleMode("dark")).toBe("system");
  });

  test("applies dark class from explicit and system modes", () => {
    const document = themeDocument();
    const { win } = themeWindow(true);

    applyTheme(document.documentElement, win.matchMedia, "system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyTheme(document.documentElement, win.matchMedia, "light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    applyTheme(document.documentElement, win.matchMedia, "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("updates icons, tooltip text, and button labels", () => {
    const document = themeDocument();

    updateThemeUI(document, "light");

    expect(
      document
        .querySelector('[data-theme-icon="light"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
    expect(
      document
        .querySelector('[data-theme-icon="dark"]')
        ?.classList.contains("hidden"),
    ).toBe(true);
    expect(
      document
        .querySelector('[data-tooltip-text="light"]')
        ?.classList.contains("hidden"),
    ).toBe(false);
    expect(
      document.querySelector("[data-theme-toggle]")?.getAttribute("aria-label"),
    ).toBe("Theme: light");
  });

  test("applies theme immediately and removes transition class on animation frames", () => {
    const document = themeDocument();
    const { win } = themeWindow(false);

    vi.spyOn(document.documentElement, "getBoundingClientRect").mockReturnValue(
      {} as DOMRect,
    );

    applyThemeImmediately(document.documentElement, win, "dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-switching")).toBe(
      false,
    );
    expect(win.requestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  test("initializes buttons, handles clicks, and reacts to system changes", () => {
    const document = themeDocument();
    const storage = new MemoryStorage();
    const { win, listeners } = themeWindow(true);

    initThemeToggle(document, win, storage);

    const button = document.querySelector("[data-theme-toggle]")!;
    expect(button.getAttribute("data-initialized")).toBe("true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    button.dispatchEvent(new document.defaultView!.Event("click"));
    expect(storage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    setStoredMode(storage, "system");
    listeners[0]?.();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  test("does not add duplicate system preference listeners", () => {
    const document = themeDocument();
    const storage = new MemoryStorage();
    const { win, listeners } = themeWindow(true);

    initThemeToggle(document, win, storage);
    initThemeToggle(document, win, storage);

    expect(listeners).toHaveLength(1);
  });
});
