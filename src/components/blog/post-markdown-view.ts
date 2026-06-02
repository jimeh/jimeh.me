import { copyText, type ClipboardWriter } from "./copy-text";

type ResetTimeout = (callback: () => void, delay: number) => unknown;

const ARTICLE_LABEL = "Show rendered post";
const MARKDOWN_HASH = "#markdown";
const MARKDOWN_LABEL = "Show Markdown view";

/** Initializes the rendered/Markdown view toggle for blog post pages. */
export function initPostMarkdownView(
  root: ParentNode,
  clipboard?: ClipboardWriter,
  setResetTimeout: ResetTimeout = setTimeout,
): void {
  const doc = rootDocument(root);
  const win = doc.defaultView;
  const toggle = root.querySelector<HTMLButtonElement>(
    "[data-post-markdown-toggle]",
  );
  const markdownView = root.querySelector<HTMLElement>(
    "[data-post-markdown-view]",
  );
  const copyButton = root.querySelector<HTMLButtonElement>(
    "[data-post-markdown-copy]",
  );

  if (!toggle || !markdownView) return;

  const toggleButton = toggle;
  const sourceView = markdownView;
  const htmlViews = root.querySelectorAll<HTMLElement>("[data-post-html-view]");

  function setMarkdownMode(enabled: boolean): void {
    for (const view of htmlViews) {
      view.classList.toggle("hidden", enabled);
      view.toggleAttribute("aria-hidden", enabled);
    }

    sourceView.classList.toggle("hidden", !enabled);
    sourceView.toggleAttribute("aria-hidden", !enabled);
    toggleButton.setAttribute("aria-pressed", String(enabled));
    toggleButton.setAttribute(
      "aria-label",
      enabled ? ARTICLE_LABEL : MARKDOWN_LABEL,
    );

    updateStateElements(root, "[data-post-view-icon]", enabled);
    updateStateElements(root, "[data-post-view-tooltip]", enabled);
  }

  if (!toggleButton.dataset.initialized) {
    toggleButton.dataset.initialized = "true";
    toggleButton.addEventListener("click", () => {
      const enabled = toggleButton.getAttribute("aria-pressed") !== "true";
      setMarkdownMode(enabled);
      updateUrlState(win, enabled);
    });
  }

  setMarkdownMode(isMarkdownHash(win));
  initHistorySync(root, win, setMarkdownMode);

  if (!copyButton || copyButton.dataset.initialized) return;

  copyButton.dataset.initialized = "true";
  copyButton.addEventListener("click", async () => {
    const code = root.querySelector("[data-post-markdown-code] code");
    if (!code) return;

    const copied = await copyText(root, code.textContent ?? "", clipboard);
    if (!copied) return;

    setCopiedState(root, true);

    setResetTimeout(() => {
      setCopiedState(root, false);
    }, 2000);
  });
}

function initHistorySync(
  root: ParentNode,
  win: Window | null,
  setMarkdownMode: (enabled: boolean) => void,
): void {
  if (!win) return;

  const doc = rootDocument(root);
  const cleanupKey = "__postMarkdownCleanup";
  const previousCleanup = (doc.documentElement as PostMarkdownRoot)[cleanupKey];
  previousCleanup?.();

  const syncFromUrl = () => {
    setMarkdownMode(isMarkdownHash(win));
  };

  win.addEventListener("hashchange", syncFromUrl);
  win.addEventListener("popstate", syncFromUrl);

  (doc.documentElement as PostMarkdownRoot)[cleanupKey] = () => {
    win.removeEventListener("hashchange", syncFromUrl);
    win.removeEventListener("popstate", syncFromUrl);
  };
}

function isMarkdownHash(win: Window | null): boolean {
  return win?.location?.hash === MARKDOWN_HASH;
}

function updateUrlState(win: Window | null, enabled: boolean): void {
  if (!win?.location || !win.history) return;

  const url = new URL(win.location.href);
  url.hash = enabled ? MARKDOWN_HASH.slice(1) : "";

  if (url.href === win.location.href) return;

  win.history.pushState({ postMarkdownView: enabled }, "", url.href);
}

function rootDocument(root: ParentNode): Document {
  if ((root as Node).nodeType === 9) {
    return root as Document;
  }

  const doc = (root as Node).ownerDocument;
  if (!doc) {
    throw new Error("Unable to resolve owner document for Markdown copy.");
  }

  return doc;
}

interface PostMarkdownRoot extends HTMLElement {
  __postMarkdownCleanup?: () => void;
}

function updateStateElements(
  root: ParentNode,
  selector: string,
  markdownMode: boolean,
): void {
  const active = markdownMode ? "article" : "markdown";

  for (const el of root.querySelectorAll<HTMLElement>(selector)) {
    const value =
      el.dataset.postViewIcon ?? el.dataset.postViewTooltip ?? undefined;
    el.classList.toggle("hidden", value !== active);
  }
}

function setCopiedState(root: ParentNode, copied: boolean): void {
  for (const icon of root.querySelectorAll<HTMLElement>(
    "[data-post-markdown-copy-icon]",
  )) {
    icon.classList.toggle(
      "hidden",
      icon.dataset.postMarkdownCopyIcon !== (copied ? "copied" : "copy"),
    );
  }

  for (const label of root.querySelectorAll<HTMLElement>(
    "[data-post-markdown-copy-label]",
  )) {
    label.classList.toggle(
      "hidden",
      label.dataset.postMarkdownCopyLabel !== (copied ? "copied" : "copy"),
    );
  }
}
