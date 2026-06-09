import { describe, expect, test } from "vitest";
import { renderYouTubeMarkdown } from "./YouTube.markdown";

describe("renderYouTubeMarkdown", () => {
  test("renders a canonical YouTube Markdown link", () => {
    expect(
      renderYouTubeMarkdown(
        {
          src: "https://www.youtube.com/watch?v=ea6UuRTjkKs",
          title: "Hard Can Be Fun",
        },
        { children: "" },
      ),
    ).toBe(
      "[Video: Hard Can Be Fun](https://www.youtube.com/watch?v=ea6UuRTjkKs)",
    );
  });

  test("keeps unsupported URL sources unchanged", () => {
    expect(
      renderYouTubeMarkdown(
        {
          src: "https://example.com/watch?v=ea6UuRTjkKs",
          title: "External video",
        },
        { children: "" },
      ),
    ).toBe("[Video: External video](https://example.com/watch?v=ea6UuRTjkKs)");
  });

  test("treats non-URL sources as bare YouTube IDs", () => {
    expect(
      renderYouTubeMarkdown(
        {
          src: "ea6UuRTjkKs",
          title: "Bare ID",
        },
        { children: "" },
      ),
    ).toBe("[Video: Bare ID](https://www.youtube.com/watch?v=ea6UuRTjkKs)");
  });
});
