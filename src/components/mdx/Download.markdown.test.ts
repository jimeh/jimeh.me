import { describe, expect, test } from "vitest";
import { renderDownloadMarkdown } from "./Download.markdown";

describe("renderDownloadMarkdown", () => {
  test("renders a Markdown download link with slot text", () => {
    expect(
      renderDownloadMarkdown(
        { href: "/assets/reflection.zip" },
        { children: "reflection.zip" },
      ),
    ).toBe("[Download: reflection.zip](/assets/reflection.zip)");
  });
});
