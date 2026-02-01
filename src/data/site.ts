export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    nickname: string;
  };
  email: {
    // ROT13-encoded plaintext values for anti-spam obfuscation.
    // Decoded client-side and applied to pre-rendered DOM elements.
    rot13Href: string;
    rot13Text: string;
  };
  social: {
    name: string;
    links: string[];
  };
}

export interface SiteLink {
  name: string;
  url: string;
  icon: string;
  rel?: string;
}

export const siteConfig: SiteConfig = {
  title: "Jim Myhrberg (jimeh)",
  description: "Software Engineering Mercenary",
  url: "https://jimeh.me",
  author: {
    name: "Jim Myhrberg",
    nickname: "jimeh",
  },
  email: {
    // ROT13 of "mailto:contact@jimeh.me"
    rot13Href: "znvygb:pbagnpg@wvzru.zr",
    // ROT13 of "contact@jimeh.me"
    rot13Text: "pbagnpg@wvzru.zr",
  },
  social: {
    name: "Jim Myhrberg",
    links: [
      "https://github.com/jimeh",
      "https://bsky.app/profile/jimeh.me",
      "https://mastodon.social/@jimeh",
      "https://twitter.com/jimeh",
      "https://jimeh.io/",
      "https://www.linkedin.com/in/jimeh",
      "https://www.last.fm/user/jimeh",
      "https://flickr.com/photos/jimeh/",
      "https://keybase.io/jimeh",
    ],
  },
};

export const siteLinks: SiteLink[] = [
  {
    name: "github",
    url: "https://github.com/jimeh",
    icon: "fa6-brands:github",
  },
  {
    name: "bluesky",
    url: "https://bsky.app/profile/jimeh.me",
    icon: "fa6-brands:bluesky",
  },
  {
    name: "mastodon",
    url: "https://mastodon.social/@jimeh",
    icon: "fa6-brands:mastodon",
    rel: "me",
  },
  {
    name: "blog",
    url: "https://jimeh.io/",
    icon: "fa6-solid:newspaper",
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/in/jimeh",
    icon: "fa6-brands:linkedin",
  },
  {
    name: "last.fm",
    url: "https://www.last.fm/user/jimeh",
    icon: "fa6-brands:square-lastfm",
  },
  {
    name: "flickr",
    url: "https://flickr.com/photos/jimeh",
    icon: "fa6-brands:flickr",
  },
  {
    name: "vcard",
    url: "https://assets.jimeh.me/jim-myhrberg.vcf",
    icon: "fa6-solid:address-card",
  },
  {
    name: "cv (pdf)",
    url: "https://jimeh.me/cv",
    icon: "fa6-solid:file-pdf",
  },
];
