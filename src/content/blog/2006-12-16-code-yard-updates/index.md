---
title: "Code Yard updates"
description:
  "I just updated and added a few PHP scripts to Code Yard that might be useful
  for some :)"
date: 2006-12-16
archive: zhuoqe.org
tags: ["development", "php"]
---

I just updated and added a few PHP scripts to [Code Yard](/svn/codeyard/trunk/)
that might be useful for some :)

- Updated and fixed some bugs in
  [`parseCSV{}`](/svn/codeyard/trunk/php/classes/parseCSV/) and
  [`parseINI{}`](/svn/codeyard/trunk/php/classes/parseINI/).

- [`speedometer{}`](/svn/codeyard/trunk/php/classes/speedometer/) — Class for
  simplifying calculation of script execution time.

- [`walkDir{}`](/svn/codeyard/trunk/php/classes/walkDir/) — Class for
  recursively getting a list of directory contents. It returns both a
  multi-dimentional array, and a plain array with full paths, both types of
  output are optional increase performance. The number of directory levels to
  walk down into is also configurable.

- [`rfile()` & `wfile()`](/svn/codeyard/trunk/php/functions/readwrite.func.php)
  — Functions for reading and writeing to local files. I wrote these about 3-4
  years ago, and i've used them ever since, they've undergone some slight
  modifications since then, but their still basically the same. Their quite
  flexible, fast, and save a lot of time.

- [`randpass()`](/svn/codeyard/trunk/php/functions/randpass.func.php) — Function
  with a quite self-explanatory name. Generates a random password of any desired
  length using the character ranges you specify. It can be made more flexible,
  but its perfect for most situations when you need to generate a random
  password.
