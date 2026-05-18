import { parseHTML } from "linkedom";
import { describe, expect, test } from "vitest";

import SiteLink from "./SiteLink.astro";
import { initRot13Links, rot13 } from "./site-link";
import { renderComponent } from "./test-utils";

describe("SiteLink", () => {
  test("renders standard links with text, icon, and rel safety attributes", async () => {
    const document = await renderComponent(SiteLink, {
      icon: "fa6-brands:github",
      name: "github",
      url: "https://github.com/jimeh",
      rel: "me",
    });
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("https://github.com/jimeh");
    expect(link?.getAttribute("rel")).toBe("me noopener noreferrer");
    expect(link?.querySelector("svg")).not.toBeNull();
    expect(link?.querySelector("[data-link-text]")?.textContent).toBe("github");
    expect(link?.hasAttribute("data-rot13-href")).toBe(false);
  });

  test("renders ROT13 links as placeholders with encoded metadata", async () => {
    const document = await renderComponent(SiteLink, {
      icon: "fa6-solid:envelope",
      rot13Href: "znvygb:pbagnpg@wvzru.zr",
      rot13Text: "pbagnpg@wvzru.zr",
    });
    const link = document.querySelector("a");

    expect(link?.getAttribute("href")).toBe("#");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link?.getAttribute("data-rot13-href")).toBe(
      "znvygb:pbagnpg@wvzru.zr",
    );
    expect(link?.getAttribute("data-rot13-text")).toBe("pbagnpg@wvzru.zr");
    expect(link?.querySelector("[data-link-text]")?.textContent).toBe("");
  });
});

describe("site-link helpers", () => {
  test("decodes ROT13 strings", () => {
    expect(rot13("znvygb:pbagnpg@wvzru.zr")).toBe("mailto:contact@jimeh.me");
    expect(rot13("Hello, World!")).toBe("Uryyb, Jbeyq!");
  });

  test("initializes ROT13 links in a DOM root", () => {
    const { document } = parseHTML(`
      <a data-rot13-href="znvygb:pbagnpg@wvzru.zr" data-rot13-text="pbagnpg@wvzru.zr" href="#">
        <span data-link-text></span>
      </a>
    `);
    const link = document.querySelector("a")!;

    initRot13Links(document);

    expect(link.getAttribute("href")).toBe("mailto:contact@jimeh.me");
    expect(link.querySelector("[data-link-text]")?.textContent).toBe(
      "contact@jimeh.me",
    );
  });
});
