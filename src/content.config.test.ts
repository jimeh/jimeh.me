import { describe, expect, test } from "vitest";

import { collections } from "./content.config";

describe("content config", () => {
  test("registers the blog content collection", () => {
    expect(collections).toHaveProperty("blog");
  });
});
