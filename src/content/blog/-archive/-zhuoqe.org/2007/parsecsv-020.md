---
title: "parseCSV 0.2.0"
description:
  "I have to get some real work done, that i can post about, cause this is
  starting to feel like i'm a broken record player just, cause all i've posted
  about la..."
date: 2007-01-01
slug: parsecsv-020
archive: zhuoqe.org
updatedDate: 2007-04-11
tags: ["development", "php"]
---

I have to get some real work done, that i can post about, cause this is starting
to feel like i'm a broken record player just, cause all i've posted about lately
is [`parseCSV{}`][parsecsv]... lol

Obviously having major hard drive problems haven't helped :P

Anyway, i spent the most part of today updating [`parseCSV{}`][parsecsv],
finishing an automatic delimiter character detection, cause the original project
i created it for, requires such a function. The reason being so users don't
really have to know what a delimiter character is, or which one the file their
attempting to upload uses. Eitherway, its a very handy function, and hardly
slows down the script at all.

The original reason i started working on it cause i realized some versions of MS
Excel for Windows uses `;` instead of `,` as a delimiter no matter which CSV
option you choose. And the script was being used to upload that from Excel,
which caused issues, so to simplify matters, some type of auto-detection was
required...

The `auto()` function works by simply analyzing a specific number of rows (15 by
default) from the beginning of the csv file/data, and eliminating characters
that simply can't be the delimiter cause it doesn't exist on every row, or the
the number of times a character appears in a row isn't the same on all rows.
Rarely will any other character than the actual delimiter get past this stage of
elimination, but if more then one character does, the script goes on to further
analyze details to choose which character is the most likely to be the
delimiter.

[parsecsv]: dead+http://zhuoqe.org/svn/codeyard/trunk/php/classes/parseCSV/
