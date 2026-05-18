/** Decodes a ROT13-obfuscated string. */
export function rot13(value: string): string {
  return value.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0) + 13;
    return String.fromCharCode(
      (char <= "Z" ? 90 : 122) >= code ? code : code - 26,
    );
  });
}

/** Decodes all ROT13-obfuscated site links in the given DOM root. */
export function initRot13Links(root: ParentNode): void {
  root
    .querySelectorAll<HTMLAnchorElement>("[data-rot13-href]")
    .forEach((el) => {
      el.href = rot13(el.dataset.rot13Href!);
      const text = el.querySelector("[data-link-text]");
      if (text) {
        text.textContent = rot13(el.dataset.rot13Text!);
      }
    });
}
