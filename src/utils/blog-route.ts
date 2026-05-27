export const BLOG_POST_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

interface BlogRouteInput {
  date: string;
  slug: string;
}

/** Returns the year segment for a blog post route from its date. */
export function blogRouteYear(date: string): string {
  return date.slice(0, 4);
}

/** Returns the filename- or directory-derived slug for a blog post source. */
export function blogSourceSlug(id: string): string {
  const parts = id.split("/").filter(Boolean);
  const basename = parts.at(-1) ?? id;

  if (basename === "index") {
    return parts.at(-2) ?? basename;
  }

  return basename;
}

/** Returns the canonical slug segment for a blog post route. */
export function blogRouteSlug({ slug }: BlogRouteInput): string {
  return slug;
}

/** Returns the route parameter for a blog post page. */
export function blogRoutePath(input: BlogRouteInput): string {
  return `${blogRouteYear(input.date)}/${blogRouteSlug(input)}`;
}
