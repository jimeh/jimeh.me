export type ThemeMode = "system" | "light" | "dark";

const LABELS: Record<ThemeMode, string> = {
  system: "Theme: system preference",
  light: "Theme: light",
  dark: "Theme: dark",
};

interface MediaQueryListLike {
  matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
}

interface ThemeWindowLike {
  matchMedia(query: string): MediaQueryListLike;
  requestAnimationFrame(callback: () => void): unknown;
}

/** Reads the stored theme mode, defaulting invalid or unavailable values. */
export function getStoredMode(storage: Storage): ThemeMode {
  try {
    const stored = storage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage unavailable
  }
  return "system";
}

/** Persists a theme mode, removing storage for the system preference mode. */
export function setStoredMode(storage: Storage, mode: ThemeMode): void {
  try {
    if (mode === "system") {
      storage.removeItem("theme");
    } else {
      storage.setItem("theme", mode);
    }
  } catch {
    // localStorage unavailable
  }
}

/** Returns the next theme mode in the UI cycle. */
export function cycleMode(current: ThemeMode): ThemeMode {
  if (current === "system") return "light";
  if (current === "light") return "dark";
  return "system";
}

/** Applies dark mode to the root element for a theme mode. */
export function applyTheme(
  root: HTMLElement,
  matchMedia: ThemeWindowLike["matchMedia"],
  mode: ThemeMode,
): void {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);
  root.classList.toggle("dark", isDark);
}

/** Applies theme changes while temporarily disabling transitions. */
export function applyThemeImmediately(
  root: HTMLElement,
  win: ThemeWindowLike,
  mode: ThemeMode,
): void {
  root.classList.add("theme-switching");
  root.getBoundingClientRect();

  applyTheme(root, win.matchMedia.bind(win), mode);

  win.requestAnimationFrame(() => {
    win.requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

/** Updates visible icons, tooltip text, and button labels for a mode. */
export function updateThemeUI(root: ParentNode, mode: ThemeMode): void {
  for (const el of root.querySelectorAll("[data-theme-icon]")) {
    const htmlEl = el as HTMLElement;
    htmlEl.classList.toggle("hidden", htmlEl.dataset.themeIcon !== mode);
  }

  for (const el of root.querySelectorAll("[data-tooltip-text]")) {
    const htmlEl = el as HTMLElement;
    htmlEl.classList.toggle("hidden", htmlEl.dataset.tooltipText !== mode);
  }

  for (const btn of root.querySelectorAll("[data-theme-toggle]")) {
    btn.setAttribute("aria-label", LABELS[mode]);
  }
}

/** Initializes all theme toggle controls in the document. */
export function initThemeToggle(
  document: Document,
  win: ThemeWindowLike,
  storage: Storage,
): void {
  const mode = getStoredMode(storage);
  applyTheme(document.documentElement, win.matchMedia.bind(win), mode);
  updateThemeUI(document, mode);

  for (const btn of document.querySelectorAll("[data-theme-toggle]")) {
    const htmlBtn = btn as HTMLElement;
    if (htmlBtn.dataset.initialized) continue;
    htmlBtn.dataset.initialized = "true";

    btn.addEventListener("click", () => {
      const next = cycleMode(getStoredMode(storage));
      setStoredMode(storage, next);
      applyThemeImmediately(document.documentElement, win, next);
      updateThemeUI(document, next);
    });
  }

  if (document.documentElement.dataset.themeMediaInitialized) return;
  document.documentElement.dataset.themeMediaInitialized = "true";

  win
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (getStoredMode(storage) === "system") {
        applyThemeImmediately(document.documentElement, win, "system");
      }
    });
}
