import { expect, test } from "vitest";

import {
  scaledPixelSize,
  scaledResponsiveSize,
  scaledThumbnailWidths,
  thumbnailSizeScale,
} from "./thumbnail-size";

test("converts valid percentage sizes into scale factors", () => {
  expect(thumbnailSizeScale("75%")).toBe(0.75);
  expect(thumbnailSizeScale("125.5%")).toBe(1.255);
});

test("falls back to default scale for missing or invalid sizes", () => {
  expect(thumbnailSizeScale()).toBe(1);
  expect(thumbnailSizeScale("wide")).toBe(1);
  expect(thumbnailSizeScale("0%")).toBe(1);
  expect(thumbnailSizeScale("-50%")).toBe(1);
});

test("scales, caps, deduplicates, and sorts thumbnail widths", () => {
  expect(scaledThumbnailWidths([320, 160, 160], "50%", 120)).toEqual([80, 120]);
});

test("ignores invalid source width caps", () => {
  expect(scaledThumbnailWidths([100, 200], "110%", -1)).toEqual([111, 221]);
  expect(scaledThumbnailWidths([100, 200], "110%", Number.NaN)).toEqual([
    111, 221,
  ]);
});

test("returns fixed pixel sizes scaled from the base width", () => {
  expect(scaledPixelSize(160, "75%")).toBe("120px");
  expect(scaledPixelSize(161, "33.3%")).toBe("54px");
});

test("returns responsive sizes scaled from base viewport hints", () => {
  expect(scaledResponsiveSize(960, 100, 3, "50%")).toBe(
    "(min-width: 1008px) 480px, calc(50vw - 1.5rem)",
  );
  expect(scaledResponsiveSize(720, 100, 3, "50%")).toBe(
    "(min-width: 768px) 360px, calc(50vw - 1.5rem)",
  );
});
