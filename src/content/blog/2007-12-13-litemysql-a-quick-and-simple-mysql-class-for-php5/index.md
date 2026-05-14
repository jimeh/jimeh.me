---
title: "LiteMySQL — A quick and simple MySQL class for PHP5"
description:
  "Today I released a small and quick side-project called LiteMySQL. It's
  basically a PHP5 class which is designed to automate the boring repetitive
  tasks of op..."
date: 2007-12-13
archive: zydev.info
updatedDate: 2008-02-06
tags: ["development", "php"]
---

Today I released a small and quick side-project called
[LiteMySQL](http://code.google.com/p/litemysql/). It's basically a PHP5 class
which is designed to automate the boring repetitive tasks of opening and
managing database connections, looping through the query result resource to get
an array and so on.

I created this for a small project I'm working on which basically needs database
access on less than a handful of pages. And so I'd have a ready to use MySQL
solution other small projects in the future.

And sorry for the lack of information on the project page as of now, but I gotta
finish off the original project which motivated me to create LiteMySQL. Once
done I'll update the project page with relevant information :)

**Example Usage:**

```php
# general usage
$sql = new litemysql('host', 'username', 'password', 'database', 'table');
$rows = $sql->find_all();

# conditions
# - the following three uses of the find
#   function all produce identical results
$result = $sql->find(3);
$result = $sql->find(array('id' => 3));
$result = $sql->find('`id` = 3');

# insert a single row
$sql->insert(
   array(
      'title' => 'hello world',
      'body' => 'my first blog post :D',
      'author' => 'John Doe'
   )
);
```
