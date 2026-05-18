import { expect, test } from "vitest";

import DeadLink from "./DeadLink.astro";
import Download from "./Download.astro";
import Figure from "./Figure.astro";
import Image from "./Image.astro";
import ImageGrid from "./ImageGrid.astro";
import YouTube from "./YouTube.astro";

test("exports public MDX components", async () => {
  const exports = await import("./index");

  expect(exports).toMatchObject({
    DeadLink,
    Download,
    Figure,
    Image,
    ImageGrid,
    YouTube,
  });
  expect("Credit" in exports).toBe(false);
});
