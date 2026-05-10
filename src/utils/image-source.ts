import type { ImageMetadata } from "astro";

export type ImageSource =
  | ImageMetadata
  | {
      light: ImageMetadata;
      dark?: ImageMetadata;
    };

/** Returns the light/default image from a single or light/dark source. */
export function lightImage(source: ImageSource): ImageMetadata {
  return "light" in source ? source.light : source;
}

/** Returns the dark image variant from a light/dark source, if present. */
export function darkImage(source: ImageSource): ImageMetadata | undefined {
  return "light" in source ? source.dark : undefined;
}
