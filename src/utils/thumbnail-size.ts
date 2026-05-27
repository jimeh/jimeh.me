const DEFAULT_SCALE = 1;

function sourceWidthLimit(sourceWidth?: number): number {
  return typeof sourceWidth === "number" &&
    Number.isFinite(sourceWidth) &&
    sourceWidth > 0
    ? Math.floor(sourceWidth)
    : Number.POSITIVE_INFINITY;
}

function uniqueSortedWidths(widths: number[]): number[] {
  return [
    ...new Set(widths.map((width) => Math.max(1, Math.ceil(width)))),
  ].sort((a, b) => a - b);
}

/** Converts a percentage thumbnail size into a scale factor. */
export function thumbnailSizeScale(size?: string): number {
  if (!size) {
    return DEFAULT_SCALE;
  }

  const value = Number.parseFloat(size);
  return Number.isFinite(value) && value > 0 ? value / 100 : DEFAULT_SCALE;
}

/** Returns image widths scaled for CSS-sized thumbnail image content. */
export function scaledThumbnailWidths(
  baseWidths: number[],
  thumbnailSize?: string,
  sourceWidth?: number,
): number[] {
  const scale = thumbnailSizeScale(thumbnailSize);
  const maxWidth = sourceWidthLimit(sourceWidth);
  const widths = baseWidths.map((width) => Math.min(width * scale, maxWidth));

  return uniqueSortedWidths(widths);
}

/** Returns a fixed pixel `sizes` value scaled for thumbnail image content. */
export function scaledPixelSize(
  baseWidth: number,
  thumbnailSize?: string,
): string {
  return `${Math.ceil(baseWidth * thumbnailSizeScale(thumbnailSize))}px`;
}

/** Returns a responsive `sizes` value scaled for thumbnail image content. */
export function scaledResponsiveSize(
  desktopWidth: number,
  viewportWidth: number,
  viewportRemOffset: number,
  thumbnailSize?: string,
): string {
  const scale = thumbnailSizeScale(thumbnailSize);
  const desktopSize = Math.ceil(desktopWidth * scale);
  const viewportSize = Number((viewportWidth * scale).toFixed(3));
  const offsetSize = Number((viewportRemOffset * scale).toFixed(3));
  const minWidthPx =
    viewportWidth > 0
      ? Math.ceil(
          ((desktopWidth + viewportRemOffset * 16) * 100) / viewportWidth,
        )
      : 0;

  return `(min-width: ${minWidthPx}px) ${desktopSize}px, calc(${viewportSize}vw - ${offsetSize}rem)`;
}
