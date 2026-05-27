type ResetTimeout = (callback: () => void, delay: number) => unknown;

/** Adds copy-to-clipboard buttons to all rehype-pretty-code blocks. */
export function initCodeCopyButtons(
  root: ParentNode,
  clipboard: Pick<Clipboard, "writeText">,
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

    const button = tpl.content.firstElementChild!.cloneNode(
      true,
    ) as HTMLButtonElement;
    button.dataset.codeCopyButton = "true";

    const offset = 10;
    button.style.top = `${(pre.offsetTop || 0) + offset}px`;

    const iconCopy = button.querySelector('[data-icon="copy"]')!;
    const iconCheck = button.querySelector('[data-icon="check"]')!;

    button.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      if (!code) return;

      await clipboard.writeText(code.textContent ?? "");

      iconCopy.classList.add("hidden");
      iconCheck.classList.remove("hidden");

      setResetTimeout(() => {
        iconCheck.classList.add("hidden");
        iconCopy.classList.remove("hidden");
      }, 2000);
    });

    figure.appendChild(button);
  }
}
