import { copyText, type ClipboardWriter } from "./copy-text";

type ResetTimeout = (callback: () => void, delay: number) => unknown;

/** Adds copy-to-clipboard buttons to all rehype-pretty-code blocks. */
export function initCodeCopyButtons(
  root: ParentNode,
  clipboard?: ClipboardWriter,
  setResetTimeout: ResetTimeout = setTimeout,
): void {
  const tpl = root.querySelector<HTMLTemplateElement>("#code-copy-btn-tpl");
  if (!tpl) throw new Error("Missing #code-copy-btn-tpl template");

  const figures = root.querySelectorAll<HTMLElement>(
    "figure[data-rehype-pretty-code-figure]",
  );

  for (const figure of figures) {
    const pre = figure.querySelector("pre");
    if (!pre) continue;
    if (figure.querySelector("[data-code-copy-button]")) continue;

    figure.style.position = "relative";

    const control = tpl.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLElement;
    const button = control.querySelector<HTMLButtonElement>("button");
    if (!button) continue;

    control.dataset.codeCopyControl = "true";
    button.dataset.codeCopyButton = "true";

    const offset = 10;
    control.style.top = `${(pre.offsetTop || 0) + offset}px`;

    const iconCopy = button.querySelector('[data-icon="copy"]')!;
    const iconCheck = button.querySelector('[data-icon="check"]')!;
    const status = control.querySelector<HTMLElement>(
      "[data-code-copy-status]",
    );

    button.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      if (!code) return;

      const copied = await copyText(root, code.textContent ?? "", clipboard);
      if (!copied) return;

      iconCopy.classList.add("hidden");
      iconCheck.classList.remove("hidden");
      if (status) status.textContent = "Copied!";
      status?.classList.remove("opacity-0");
      status?.classList.add("opacity-100");

      setResetTimeout(() => {
        iconCheck.classList.add("hidden");
        iconCopy.classList.remove("hidden");
        if (status) status.textContent = "";
        status?.classList.add("opacity-0");
        status?.classList.remove("opacity-100");
      }, 2000);
    });

    figure.appendChild(control);
  }
}
