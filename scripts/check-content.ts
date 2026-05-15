import { readdirSync } from "node:fs";
import { join } from "node:path";

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

for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const postDir = join(blogDir, entry.name);
  const indexFiles = readdirSync(postDir).filter((file) =>
    /^index\.mdx?$/.test(file),
  );

  if (indexFiles.length !== 1) {
    failures.push(
      `${entry.name}: expected exactly one index.md or index.mdx file, ` +
        `found ${indexFiles.length}.`,
    );
  }
}

for (const post of readBlogPostFiles()) {
  const label = postLabel(post);
  const route = blogPostRoute(post.dirName);

  if (!route) {
    failures.push(
      `${label}: blog directories must use YYYY-MM-DD-slug naming.`,
    );
    continue;
  }

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
  if (date !== route.date) {
    failures.push(
      `${label}: frontmatter date must match directory date ${route.date}.`,
    );
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
