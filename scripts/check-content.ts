import { BLOG_POST_SLUG_PATTERN } from "../src/utils/blog-route.ts";
import {
  blogPostRoute,
  displayPath,
  frontmatter,
  frontmatterBlockScalar,
  frontmatterNestedBlockScalar,
  frontmatterPathScalar,
  frontmatterScalar,
  frontmatterStringArray,
  getBlogDir,
  localPostAssetExists,
  localStaticImports,
  postLabel,
  readBlogPostFiles,
} from "./blog-content.ts";

const failures: string[] = [];
const blogDir = getBlogDir();
const routes = new Map<string, string>();

for (const post of readBlogPostFiles()) {
  const label = postLabel(post);

  const body = frontmatter(post.source);
  if (!body) {
    failures.push(`${label}: missing frontmatter block.`);
    continue;
  }

  const title = frontmatterScalar(body, "title");
  if (!title) {
    failures.push(`${label}: frontmatter must include title.`);
  }

  const description = frontmatterScalar(body, "description");
  if (!description) {
    failures.push(`${label}: frontmatter must include description.`);
  }

  const date = frontmatterScalar(body, "date");
  if (!date) {
    failures.push(`${label}: frontmatter must include date.`);
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    failures.push(`${label}: frontmatter date must use YYYY-MM-DD.`);
  }

  const slug = frontmatterScalar(body, "slug");
  if (!slug) {
    failures.push(`${label}: frontmatter must include slug.`);
  } else if (!BLOG_POST_SLUG_PATTERN.test(slug)) {
    failures.push(
      `${label}: slug must be lowercase URL segments separated by "/".`,
    );
  }

  const route = date && slug ? blogPostRoute(post, date, slug) : null;
  if (!route && date && slug) {
    failures.push(`${label}: could not derive a canonical blog route.`);
  } else if (route) {
    const previousLabel = routes.get(route.path);
    if (previousLabel) {
      failures.push(
        `${label}: route /blog/${route.path}/ duplicates ${previousLabel}.`,
      );
    } else {
      routes.set(route.path, label);
    }
  }

  const updatedDate = frontmatterScalar(body, "updatedDate");
  if (date && updatedDate && updatedDate < date) {
    failures.push(`${label}: updatedDate must not be earlier than date.`);
  }

  if (/^tags:/m.test(body)) {
    const tags = frontmatterStringArray(body, "tags");
    if (tags.length === 0) {
      failures.push(`${label}: tags must be an inline string array.`);
    }

    for (const tag of tags) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) {
        failures.push(
          `${label}: tag "${tag}" must be a lowercase slug string.`,
        );
      }
    }
  }

  const localImageSources = [
    ["image.src", frontmatterBlockScalar(body, "image", "src")],
    [
      "image.thumbnail.src",
      frontmatterPathScalar(body, ["image", "thumbnail", "src"]),
    ],
    [
      "image.thumbnail.src.light",
      frontmatterPathScalar(body, ["image", "thumbnail", "src", "light"]),
    ],
    [
      "image.thumbnail.src.dark",
      frontmatterPathScalar(body, ["image", "thumbnail", "src", "dark"]),
    ],
    [
      "image.src.light",
      frontmatterNestedBlockScalar(body, "image", "src", "light"),
    ],
    [
      "image.src.dark",
      frontmatterNestedBlockScalar(body, "image", "src", "dark"),
    ],
  ] as const;

  for (const [field, src] of localImageSources) {
    if (src && !localPostAssetExists(post, src)) {
      failures.push(`${label}: ${field} points at missing local asset ${src}.`);
    }
  }

  for (const importPath of localStaticImports(post)) {
    if (!localPostAssetExists(post, importPath)) {
      failures.push(
        `${label}: static import points at missing local asset ${importPath}.`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("Content checks failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(
    `Checked blog content in ${displayPath(blogDir)}. ` +
      "Fix the source file or update the repository invariant.",
  );
  process.exitCode = 1;
} else {
  console.log("Content checks passed.");
}
