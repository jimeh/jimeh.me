import { expect, test } from "vitest";

import { compareBlogPostsAsc, compareBlogPostsDesc } from "./blog-sort";

type BlogPost = Parameters<typeof compareBlogPostsDesc>[0];

function post(id: string, date: string): BlogPost {
  return { id, data: { date } } as BlogPost;
}

test("sorts posts by date descending then id descending", () => {
  const posts = [
    post("b", "2024-01-01"),
    post("a", "2025-01-01"),
    post("c", "2025-01-01"),
  ];

  posts.sort(compareBlogPostsDesc);

  expect(posts.map((item) => item.id)).toEqual(["c", "a", "b"]);
});

test("sorts posts by date ascending then id ascending", () => {
  const posts = [
    post("b", "2024-01-01"),
    post("c", "2025-01-01"),
    post("a", "2025-01-01"),
  ];

  posts.sort(compareBlogPostsAsc);

  expect(posts.map((item) => item.id)).toEqual(["b", "a", "c"]);
});

test("returns zero for identical date and id", () => {
  const value = post("same", "2025-01-01");

  expect(compareBlogPostsDesc(value, value) === 0).toBe(true);
  expect(compareBlogPostsAsc(value, value) === 0).toBe(true);
});
