import { expect, test } from "vitest";
import { resolveThumbnailFrame } from "./thumbnail-frame";

test("resolves missing frame metadata as disabled", () => {
  expect(resolveThumbnailFrame()).toEqual({
    light: false,
    dark: false,
    any: false,
  });
});

test("resolves boolean frame metadata for both color modes", () => {
  expect(resolveThumbnailFrame(true)).toEqual({
    light: true,
    dark: true,
    any: true,
  });

  expect(resolveThumbnailFrame(false)).toEqual({
    light: false,
    dark: false,
    any: false,
  });
});

test("resolves color-mode-specific frame metadata", () => {
  expect(resolveThumbnailFrame({ light: true })).toEqual({
    light: true,
    dark: false,
    any: true,
  });

  expect(resolveThumbnailFrame({ dark: true })).toEqual({
    light: false,
    dark: true,
    any: true,
  });

  expect(resolveThumbnailFrame({ light: true, dark: true })).toEqual({
    light: true,
    dark: true,
    any: true,
  });
});
