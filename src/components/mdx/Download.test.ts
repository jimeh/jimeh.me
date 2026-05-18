import { describe, expect, test } from "vitest";

import Download from "./Download.astro";
import { renderComponent } from "../test-utils";

describe("Download", () => {
  test("renders a download link with optional filename and title", async () => {
    const document = await renderComponent(
      Download,
      {
        href: "./archive.zip",
        filename: "archive.zip",
        title: "Download archive",
        class: "wide",
      },
      { default: "Archive" },
    );
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("./archive.zip");
    expect(link?.getAttribute("download")).toBe("archive.zip");
    expect(link?.getAttribute("title")).toBe("Download archive");
    expect(link?.className).toContain("wide");
    expect(link?.textContent).toContain("Archive");
  });

  test("renders download without filename or title when omitted", async () => {
    const document = await renderComponent(
      Download,
      { href: "./file.zip" },
      { default: "File" },
    );
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("./file.zip");
    expect(link?.hasAttribute("download")).toBe(false);
    expect(link?.hasAttribute("title")).toBe(false);
  });

  test("renders the download icon", async () => {
    const document = await renderComponent(
      Download,
      { href: "./file.zip" },
      { default: "File" },
    );

    expect(document.querySelector("svg")).not.toBeNull();
  });
});
