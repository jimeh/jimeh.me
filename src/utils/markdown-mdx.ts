import {
  mdxMarkdownRenderers,
  mdxMarkdownTransparentComponents,
} from "@mdx/markdown-renderers";
import type { MarkdownProps, MarkdownRenderer } from "@mdx/markdown";

export interface MarkdownMdxOptions {
  renderers?: Record<string, MarkdownRenderer>;
  resolveAsset?: (src: string) => string;
  transparentComponents?: Set<string>;
}

interface RenderContext {
  imports: Map<string, string>;
  options: Required<MarkdownMdxOptions>;
}

const defaultOptions: Required<MarkdownMdxOptions> = {
  renderers: mdxMarkdownRenderers,
  resolveAsset: (src) => src,
  transparentComponents: mdxMarkdownTransparentComponents,
};
const localDefaultImportPattern =
  /^import\s+(?<name>[A-Za-z_$][\w$]*)\s+from\s+["'](?<path>(?:\.{1,2}\/)+[^"']+)["'];?$/gm;

/** Renders the supported Markdown-compatible subset of blog MDX to Markdown. */
export function renderMarkdownMdx(
  source: string,
  options: MarkdownMdxOptions = {},
): string {
  const protectedSource = protectCodeFences(source);
  const context: RenderContext = {
    imports: localDefaultImports(protectedSource.source),
    options: { ...defaultOptions, ...options },
  };

  return normalizeMarkdown(
    restoreCodeFences(
      renderMarkdownMdxBody(protectedSource.source, context),
      protectedSource.fences,
    ),
  );
}

/** Returns validation failures for MDX that cannot be rendered as Markdown. */
export function markdownMdxFailures(
  source: string,
  options: MarkdownMdxOptions = {},
): string[] {
  try {
    renderMarkdownMdx(source, options);

    return [];
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
}

function renderMarkdownMdxBody(source: string, context: RenderContext): string {
  let markdown = stripImportLines(source);

  for (const name of context.options.transparentComponents) {
    markdown = markdown
      .replace(new RegExp(`<${name}\\b[^>]*>`, "g"), "")
      .replace(new RegExp(`</${name}>`, "g"), "");
  }

  markdown = markdown.replace(
    /<(?<name>[A-Z][A-Za-z0-9]*)\b(?<attrs>[\s\S]*?)>(?<children>[\s\S]*?)<\/\k<name>>/g,
    (...args: unknown[]) => {
      const groups = args.at(-1) as
        | { attrs?: string; children?: string; name?: string }
        | undefined;

      return renderComponent(
        groups?.name ?? "",
        groups?.attrs ?? "",
        groups?.children ?? "",
        context,
      );
    },
  );

  markdown = markdown.replace(
    /<(?<name>[A-Z][A-Za-z0-9]*)\b(?<attrs>[\s\S]*?)\/>/g,
    (...args: unknown[]) => {
      const groups = args.at(-1) as
        | { attrs?: string; name?: string }
        | undefined;

      return renderComponent(
        groups?.name ?? "",
        groups?.attrs ?? "",
        "",
        context,
      );
    },
  );

  const unsupported = markdown.match(/<[A-Z][A-Za-z0-9]*(?:\s|>|\/)/);
  if (unsupported) {
    throw new Error(
      `Unsupported MDX component in Markdown export: ${unsupported[0]}`,
    );
  }

  return renderDeadLinks(markdown);
}

function renderComponent(
  name: string,
  attrs: string,
  children: string,
  context: RenderContext,
): string {
  const renderer = context.options.renderers[name];
  if (!renderer) {
    throw new Error(`Missing Markdown renderer for MDX component: ${name}`);
  }

  const props = parseProps(attrs, context);
  const childMarkdown = normalizeMarkdown(
    renderMarkdownMdxBody(children, context).replace(/<[^>]+>/g, ""),
  );

  return `\n\n${renderer(props, { children: childMarkdown })}\n\n`;
}

function parseProps(attrs: string, context: RenderContext): MarkdownProps {
  const props: MarkdownProps = {};
  const matches = attrs.matchAll(
    /\s+(?<name>[A-Za-z][\w-]*)(?:=(?:"(?<double>[^"]*)"|'(?<single>[^']*)'|\{(?<expr>[^}]*)\}))?/g,
  );

  for (const match of matches) {
    const name = match.groups?.name;
    if (!name) continue;

    const value = propValue(name, match.groups, context);
    props[name] = value;
  }

  return props;
}

function propValue(
  name: string,
  groups: Record<string, string | undefined> | undefined,
  context: RenderContext,
) {
  if (!groups) return true;
  if (groups.double !== undefined) {
    return resolvePropAsset(name, groups.double, context);
  }
  if (groups.single !== undefined) {
    return resolvePropAsset(name, groups.single, context);
  }
  if (groups.expr !== undefined) {
    return expressionValue(name, groups.expr.trim(), context);
  }

  return true;
}

function expressionValue(
  name: string,
  expr: string,
  context: RenderContext,
): boolean | number | string {
  const imported = context.imports.get(expr);
  if (imported) {
    return resolvePropAsset(name, imported, context);
  }

  if (/^["'][\s\S]*["']$/.test(expr)) {
    return resolvePropAsset(name, expr.slice(1, -1), context);
  }

  if (expr === "true") return true;
  if (expr === "false") return false;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr);

  throw new Error(
    `Unsupported MDX prop expression in Markdown export: {${expr}}`,
  );
}

function resolvePropAsset(
  name: string,
  value: string,
  context: RenderContext,
): string {
  if (!/^(?:src|darkSrc|href)$/.test(name)) {
    return value;
  }

  if (!isResolvableAsset(value)) {
    return value;
  }

  return context.options.resolveAsset(value);
}

function isResolvableAsset(value: string): boolean {
  return (
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("/src/content/")
  );
}

function localDefaultImports(source: string): Map<string, string> {
  const imports = new Map<string, string>();
  const matches = source.matchAll(localDefaultImportPattern);

  for (const match of matches) {
    const name = match.groups?.name;
    const path = match.groups?.path;
    if (name && path) {
      imports.set(name, path);
    }
  }

  return imports;
}

function stripImportLines(source: string): string {
  return source.replace(/^import\s+.+?from\s+["'][^"']+["'];?\s*$/gm, "");
}

function renderDeadLinks(markdown: string): string {
  return markdown
    .replace(
      /!?\[(?<label>[^\]]+)]\(dead\+(?<href>[^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
      (_match, ...args: unknown[]) => {
        const groups = args.at(-1) as
          | { href?: string; label?: string }
          | undefined;
        const label = groups?.label ?? "";
        const href = groups?.href ?? "";

        if (href.startsWith("missing://")) {
          return `${label} (dead link: ${href})`;
        }

        return `[${label}](${href}) (dead link)`;
      },
    )
    .replace(/<dead\+(?<href>[^>]+)>/g, (_match, ...args: unknown[]) => {
      const groups = args.at(-1) as { href?: string } | undefined;
      const href = groups?.href ?? "";

      return href.startsWith("missing://")
        ? `dead link: ${href}`
        : `[${href}](${href}) (dead link)`;
    })
    .replace(
      /^(?<prefix>\s*\[[^\]]+]:\s*)dead\+(?<href>[^\s]+)(?<rest>.*)$/gm,
      (_match, ...args: unknown[]) => {
        const groups = args.at(-1) as
          | { href?: string; prefix?: string; rest?: string }
          | undefined;
        const prefix = groups?.prefix ?? "";
        const href = groups?.href ?? "";
        const rest = groups?.rest ?? "";

        return rest.trim()
          ? `${prefix}${href}${rest}`
          : `${prefix}${href} "dead link"`;
      },
    );
}

function normalizeMarkdown(markdown: string): string {
  return `${markdown.trim().replace(/\n{3,}/g, "\n\n")}\n`;
}

function protectCodeFences(source: string): {
  fences: string[];
  source: string;
} {
  const fences: string[] = [];
  const protectedSource = source.replace(
    /(^|\n)(```[\s\S]*?\n```|~~~[\s\S]*?\n~~~)/g,
    (match) => {
      const token = `\n<!--MARKDOWN_EXPORT_CODE_FENCE_${fences.length}-->\n`;
      fences.push(match);

      return token;
    },
  );

  return { fences, source: protectedSource };
}

function restoreCodeFences(source: string, fences: string[]): string {
  return source.replace(
    /<!--MARKDOWN_EXPORT_CODE_FENCE_(\d+)-->/g,
    (_match, index: string) => fences[Number(index)] ?? "",
  );
}
