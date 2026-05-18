import { expect, test } from "vitest";
import type { ImageMetadata } from "astro";

import { darkImage, lightImage } from "./image-source";

const light = { src: "/light.jpg", width: 100, height: 50 } as ImageMetadata;
const dark = { src: "/dark.jpg", width: 100, height: 50 } as ImageMetadata;

test("returns plain image metadata as the light image", () => {
  expect(lightImage(light)).toBe(light);
  expect(darkImage(light)).toBeUndefined();
});

test("returns light and dark variants from a source pair", () => {
  const source = { light, dark };

  expect(lightImage(source)).toBe(light);
  expect(darkImage(source)).toBe(dark);
});

test("returns undefined when a source pair has no dark variant", () => {
  const source = { light };

  expect(lightImage(source)).toBe(light);
  expect(darkImage(source)).toBeUndefined();
});
