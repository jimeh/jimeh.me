export type ThumbnailFrame =
  | boolean
  | {
      light?: boolean;
      dark?: boolean;
    };

export interface ThumbnailFrameState {
  light: boolean;
  dark: boolean;
  any: boolean;
}

/** Resolves thumbnail frame frontmatter into per-color-mode flags. */
export function resolveThumbnailFrame(
  frame?: ThumbnailFrame,
): ThumbnailFrameState {
  if (typeof frame === "boolean") {
    return {
      light: frame,
      dark: frame,
      any: frame,
    };
  }

  const light = frame?.light === true;
  const dark = frame?.dark === true;

  return {
    light,
    dark,
    any: light || dark,
  };
}
