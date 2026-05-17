---
title: "Code Yard and PHP CSV Parser"
description:
  "Today i've setup a new project, called Code Yard. All it really is, is a
  Subversion repository for me to collect all my small random pieces of code
  (classes,..."
date: 2006-11-23
slug: code-yard-and-php-csv-parser
archive: zhuoqe.org
updatedDate: 2007-06-05
tags: ["development", "php"]
---

Today i've setup a new project, called
[Code Yard](dead+http://zhuoqe.org/svn/codeyard/trunk/). All it really is, is a
Subversion repository for me to collect all my small random pieces of code
(classes, functions, etc.) which i reuse every now and then. It's purpose is to
let me more easily manage all the small pieces of code currently spread out a
bit all over the place in old and current projects, and to allow others who
might find my code useful, or just save them 5 minutes of work :)

And with that explained, the first piece of code i've added is a PHP class
called
[parseCSV](dead+http://zhuoqe.org/svn/codeyard/trunk/php/classes/parseCSV/).
I've recently written this class for a small project i'm working on, i was quite
surprised to find that there was a quite lack of CSV support in PHP, and an even
larger vacuum of 3rd party classes available that fully supports the most common
types of CSV files.

Hence i wrote parseCSV to be fully compatible with the
[Wikipedia article](http://en.wikipedia.org/wiki/Comma-separated_values)
available on the topic. Which also seems to be the exact CSV formatting MS Excel
uses for example. I based my class on the processing concept of
[Ming Hong Ng's CsvFileParser](http://minghong.blogspot.com/2006/07/csv-parser-for-php.html)
class.
