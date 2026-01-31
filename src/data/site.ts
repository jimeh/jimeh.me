export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    nickname: string;
  };
  email: {
    title: string;
    href: string;
  };
  social: {
    name: string;
    links: string[];
  };
}

export interface SiteLink {
  name: string;
  url: string;
  class: string;
  rel?: string;
  id?: string;
  type?: string;
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
    // ROT13-encoded email display text. The @ and . are
    // stored as-is since ROT13 only affects [a-zA-Z].
    title: "pbagnpg@wvzru.zr",
    // ROT13-encoded mailto href with HTML entity + percent
    // encoding for additional obfuscation.
    href: "&#109;&#97;&#105;&#108;&#116;&#111;&#58;%63%6s%6r%74%61%63%74@%6e%69%6d%65%68.%6d%65",
  },
  social: {
    name: "Jim Myhrberg",
    links: [
      "https://github.com/jimeh",
      "https://bsky.app/profile/jimeh.me",
      "https://mastodon.social/@jimeh",
      "https://twitter.com/jimeh",
      "https://jimeh.io/",
      "http://www.linkedin.com/in/jimeh",
      "http://www.last.fm/user/jimeh",
      "https://flickr.com/photos/jimeh/",
      "https://keybase.io/jimeh",
    ],
  },
};

export const siteLinks: SiteLink[] = [
  {
    name: "github",
    url: "https://github.com/jimeh",
    class: "fa-brands fa-github",
  },
  {
    name: "bluesky",
    url: "https://bsky.app/profile/jimeh.me",
    class: "fa-brands fa-bluesky",
  },
  {
    name: "mastodon",
    url: "https://mastodon.social/@jimeh",
    class: "fa-brands fa-mastodon",
    rel: "me",
  },
  {
    name: "blog",
    url: "https://jimeh.io/",
    class: "fa-solid fa-newspaper",
  },
  {
    name: "linkedin",
    url: "https://www.linkedin.com/in/jimeh",
    class: "fa-brands fa-linkedin",
  },
  {
    name: "last.fm",
    url: "https://www.last.fm/user/jimeh",
    class: "fa-brands fa-square-lastfm",
  },
  {
    name: "flickr",
    url: "https://flickr.com/photos/jimeh",
    class: "fa-brands fa-flickr",
  },
  {
    name: "vcard",
    id: "vcard",
    type: "download",
    url: "https://assets.jimeh.me/jim-myhrberg.vcf",
    class: "fa-solid fa-address-card",
  },
  {
    name: "cv (pdf)",
    id: "resume",
    type: "download",
    url: "https://jimeh.me/cv",
    class: "fa-solid fa-file-pdf",
  },
];
