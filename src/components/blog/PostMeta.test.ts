import { describe, expect, test } from "vitest";

import { renderComponent } from "../test-utils";
import PostMeta from "./PostMeta.astro";

describe("PostMeta", () => {
  test("renders publication date and reading time", async () => {
    const document = await renderComponent(PostMeta, {
      date: "2025-06-09",
      readingTime: 3,
    });
    const times = [...document.querySelectorAll("time")];
    const readTime = document.querySelector("[aria-label]");

    expect(times).toHaveLength(1);
    expect(times[0]?.getAttribute("datetime")).toBe("2025-06-09");
    expect(times[0]?.textContent).toBe("June 9, 2025");
    expect(readTime?.getAttribute("aria-label")).toBe("3 minutes read");
    expect(readTime?.textContent?.trim()).toBe("3 min read");
  });

  test("renders updated date metadata when present", async () => {
    const document = await renderComponent(PostMeta, {
      date: "2025-06-09",
      updatedDate: "2025-06-10",
      readingTime: 3,
    });
    const times = [...document.querySelectorAll("time")];

    expect(times.map((time) => time.getAttribute("datetime"))).toEqual([
      "2025-06-09",
      "2025-06-10",
    ]);
    expect(document.toString()).toContain("updated");
    expect(document.toString()).toContain("June 10, 2025");
  });

  test("renders archive links only when label and href are present", async () => {
    const withArchive = await renderComponent(PostMeta, {
      date: "2025-06-09",
      readingTime: 3,
      archiveLabel: "zydev archive",
      archiveHref: "/blog/archives/zydev/",
    });
    const labelOnly = await renderComponent(PostMeta, {
      date: "2025-06-09",
      readingTime: 3,
      archiveLabel: "zydev archive",
    });

    expect(withArchive.querySelector("a")?.getAttribute("href")).toBe(
      "/blog/archives/zydev/",
    );
    expect(withArchive.querySelector("a")?.textContent?.trim()).toBe(
      "zydev archive",
    );
    expect(labelOnly.querySelector("a")).toBeNull();
  });
});
