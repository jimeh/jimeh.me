import { expect, test } from "vitest";

import Download from "./Download.astro";
import Figure from "./Figure.astro";
import Image from "./Image.astro";
import ImageGrid from "./ImageGrid.astro";
import YouTube from "./YouTube.astro";

test("exports public MDX components", async () => {
  const exports = await import("./index");

  expect(exports).toMatchObject({
    Download,
    Figure,
    Image,
    ImageGrid,
    YouTube,
  });
  expect("DeadLink" in exports).toBe(false);
  expect("Credit" in exports).toBe(false);
});
