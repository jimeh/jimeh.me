export type ClipboardWriter = Pick<Clipboard, "writeText">;

/** Copies text with a textarea fallback for restricted Clipboard API contexts. */
export async function copyText(
  root: ParentNode,
  text: string,
  clipboard?: ClipboardWriter,
): Promise<boolean> {
  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Fall back for browser contexts where the async Clipboard API is denied.
    }
  }

  return legacyCopyText(root, text);
}

function legacyCopyText(root: ParentNode, text: string): boolean {
  const doc = rootDocument(root);
  const textarea = doc.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  doc.body.append(textarea);
  textarea.focus?.();
  textarea.select?.();

  try {
    const execCommand = (doc as unknown as LegacyCopyDocument).execCommand;
    if (typeof execCommand !== "function") return false;

    return execCommand.call(doc, "copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

function rootDocument(root: ParentNode): Document {
  if ((root as Node).nodeType === 9) {
    return root as Document;
  }

  const doc = (root as Node).ownerDocument;
  if (!doc) {
    throw new Error("Unable to resolve owner document for text copy.");
  }

  return doc;
}

interface LegacyCopyDocument {
  execCommand?: (commandId: string) => boolean;
}
