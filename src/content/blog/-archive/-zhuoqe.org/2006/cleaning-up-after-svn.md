---
title: "Cleaning Up After SVN"
description:
  "If you're using SVN for keeping your source safe for web apps, you may notice
  uploading the working folder also uploads all those hidden .svn folders. Not
  id..."
date: 2006-12-12
slug: cleaning-up-after-svn
archive: zhuoqe.org
updatedDate: 2007-06-13
tags: ["development", "macos"]
---

If you're using SVN for keeping your source safe for web apps, you may notice
uploading the working folder also uploads all those hidden .svn folders. Not
ideal.

Here's the shell command to delete all those .svn files from your working
directory:

```sh
find -d "your/working/directory" -name ".svn" -exec rm -r '{}' ; -print
```

The `-d` flag (`-depth`) means the find command will "process each directory's
contents before the directory itself" so the `rm` (delete) command won't
complain it can't find a file in the structure it just deleted.

(I am not responsible if this screws up your project, I assume if you're a
developer and you're using SVN you \*should\* know what you're doing. However,
just in case you don't, once you run this command you won't be able to update
your working copy, nor commit or anything else, so... \[insert cautionary advice
here\])
