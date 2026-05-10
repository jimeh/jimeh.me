---
title: Built-in Sudo for Ruby Command-Line Tools
description:
  "A simple Ruby method to automatically re-run your script with sudo if it
  needs root access."
date: 2010-02-22
tags: ["ruby", "cli", "gist"]
image:
  src: ./gabriel-heinzer-4Mw7nkQDByk-unsplash.jpg
  size: wide
  aspect: 32/9
  credit:
    text: Photo by Gabriel Heinzer on Unsplash
    href: https://unsplash.com/photos/text-4Mw7nkQDByk
---

I was looking through [my gists][gists] today on GitHub, and decided I'd do a
couple of posts on some of the pieces of code I've put up there. The first of
which is the `sudome` Ruby method.

Ever written a command-line tool in Ruby that requires root access for one
reason or another? The simplest way to achieve this is to have the end user call
the command via `sudo`. It's not the most elegant solution there is, but it
works.

A more elegant solution might be what the [Fink Project][fink] is doing with
their `fink` command. It doesn't need to be run via `sudo`, as it calls it
within itself. Meaning that when you run `fink`, you'll be prompted to type your
password, just as if you had used `sudo`. Some might argue that this is not good
practice, and they are probably right. But it all depends on the details of what
you're doing.

A while back I was working on something which the best solution was to make sure
the tool always runs as root. To get identical functionality as Fink, I wrote
the very simple method shown below:

```ruby
def sudome
  if ENV["USER"] != "root"
    exec("sudo #{ENV['_']} #{ARGV.join(' ')}")
  end
end
```

Simply call `sudome` as early as possible in your code. If needed it will re-run
your script with `sudo`, requiring the user to type his password, at which point
your script then has full root access to the system.

» [Original Gist on GitHub][gist]

[gists]: http://gist.github.com/jimeh
[fink]: http://www.finkproject.org/
[gist]: http://gist.github.com/239876
