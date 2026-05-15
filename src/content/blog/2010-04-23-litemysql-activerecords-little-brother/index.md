---
title: "LiteMySQL: ActiveRecord's Little Brother"
description:
  "A lightweight MySQL PHP library for when a full ORM is overkill but raw
  queries are too tedious."
date: 2010-04-23
tags: ["php", "database", "open-source"]
archive: true
---

Ever needed a quick and lightweight MySQL PHP library for some small
single/multi page project? Pulling out a full ORM is just overkill, but writing
the PHP code needed to connect to the server, run a query, and process the
results is a lot of hassle? I thought so. I've been there too.

So what if you could do something like this:

```php
<?php
$sql = new litemysql('host', 'username', 'password', 'testdb', 'books');
$books = $sql->find_all(array("author" => "John Twelve Hawks"));
?>
```

Rather than something like this:

```php
<?php
$db = mysql_connect("host", "username", "password");
if (!$db) die("Could not connect: " . mysql_error());
$db_selected = mysql_select_db("testdb", $link);
if (!$db_selected) die("Can't use testdb : " . mysql_error());
$result = mysql_query("SELECT * FROM `books` WHERE `author` = 'John Twelve Hawks';");
$books = array();
while ($row = mysql_fetch_assoc($result)) {
    $books[] = $row;
}
?>
```

About two years ago, I found myself in need of just such a small, lightweight
library. There were full ORMs like [ADOdb][] and others available, but they were
serious overkill for the kind of simple stuff I needed. After some googling, I
noticed there didn't seem to be any in-between libraries. Either you had to go
for a whole jumbo jet, or start folding your own paper airplanes, and I didn't
like either option. I just wanted to grab existing paper airplanes, and start
throwing them in the direction I needed them to go.

So in true geek fashion when you want something ready-made to make your life
easy, I ended up building my own such library. Spending an order of magnitude
more time on the MySQL connection part of the project than I would have needed
if I'd just done it the ugly way as the second code example above.

And that's how I started building [LiteMySQL][]. Rather than building it from
the ground up though, I started by lifting the essential parts from the full
ORM/ActiveRecord implementation I'd written for [Zynapse][], and mainly just
wrote glue-code to make it a feature-complete library.

After close to a year of being ignored, I recently spent an afternoon fixing
some long-standing bugs, migrating to [GitHub][], and writing some decent
documentation for the project.

You can read more, and download the [LiteMySQL library][litemysql].

[adodb]: http://adodb.sourceforge.net/
[zynapse]: http://github.com/jimeh/zynapse
[litemysql]: http://github.com/jimeh/litemysql
[github]: http://github.com/
