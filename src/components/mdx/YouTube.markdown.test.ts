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
});
