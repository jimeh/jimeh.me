import { describe, expect, test } from "vitest";

import { rot13 } from "../components/site-link";
import { siteConfig, siteLinks } from "./site";

function normalizedUrl(url: string): string {
  return new URL(url, siteConfig.url).href.replace(/\/$/, "");
}

describe("site data", () => {
  test("keeps ROT13 email values aligned with the public contact address", () => {
    expect(rot13(siteConfig.email.rot13Href)).toBe("mailto:contact@jimeh.me");
    expect(rot13(siteConfig.email.rot13Text)).toBe("contact@jimeh.me");
  });

  test("keeps configured profile links represented in social metadata", () => {
    const socialLinks = new Set(siteConfig.social.links.map(normalizedUrl));

    for (const link of siteLinks) {
      if (link.name === "vcard" || link.name === "cv (pdf)") {
        continue;
      }

      expect(socialLinks.has(normalizedUrl(link.url))).toBe(true);
    }
  });

  test("marks Mastodon profile link for identity verification", () => {
    expect(siteLinks.find((link) => link.name === "mastodon")?.rel).toBe("me");
  });
});
