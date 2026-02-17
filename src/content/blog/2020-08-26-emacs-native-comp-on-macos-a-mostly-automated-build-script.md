---
title: "Emacs native-comp on macOS: A (mostly) automated build script"
description:
  "Warning: As of today (26th August, 2020), this works on my machine."
date: 2020-08-26
updatedDate: 2020-10-04
tags: ["emacs", "text-editor", "macos", "gcc"]
---

## TL;DR:

**_Warning:_** _As of today (26th August, 2020), this works on my machine. Your
luck may vary. Use at your own risk._

About ten days ago I got
[native-comp/gccemacs](https://akrl.sdf.org/gccemacs.html) working in my
personal [build script](https://github.com/jimeh/build-emacs-for-macos) which
produces a self-contained Emacs.app macOS application.

I highly recommend reading the
[Native Comp](https://github.com/jimeh/build-emacs-for-macos#native-comp)
section of the README before doing anything, as it gives some context of what's
needed to make this work, why, and also some config tweaks you will need to
make.

After that, it's basically just:

1.  Ensure [Xcode](https://apps.apple.com/gb/app/xcode/id497799835?mt=12) and
    [Homebrew](https://brew.sh/) are installed.
2.  Clone the repo:
    [github.com/jimeh/build-emacs-for-macos](https://github.com/jimeh/build-emacs-for-macos)
3.  Run: `brew bundle`
4.  Run: `./build-emacs-for-macos feature/native-comp`
5.  Check `builds` directory for a `*.tbz` archive containing the built
    Emacs.app.

## The long version

I have a hacky build script which produces completely self-contained Emacs.app
applications. Every few years I dust it off and update it whenever I start
toying with and/or using upcoming features not available in a stable release
yet.

I had been using Emacs 27.x builds since around February this year, and around
two weeks ago I came across a
[few](https://www.reddit.com/r/emacs/comments/hztv4a/tutorial_for_building_gccemacs_on_macos_catalina/)
[posts](https://www.reddit.com/r/emacs/comments/i80qe2/emacs_nativecomp_on_macos/)
on [r/emacs](https://www.reddit.com/r/emacs) with instructions for building a
native-comp/gccemacs capable version of Emacs for macOS. So I decided to try and
get my build script working with it.

I've now been using macOS Emacs builds with native-comp support since Monday
last week (August 17th) without any issues impacting my day job. For reference
the Emacs config I use is available here:
[github.com/jimeh/.emacs.d](https://github.com/jimeh/.emacs.d)

The [Native Comp](https://github.com/jimeh/build-emacs-for-macos#native-comp)
section of the README contains a decent bit of useful/important information for
how to configure native-comp, and how to work around a few issues.

Also expect high CPU usage for a while after initial launch as it's native
compiling and caching all lisp code that's been loaded by your config. Progress
is printed in the `*Async-native-compile-log*` buffer. Once it's finished CPU
usage will drop down to normal, and Emacs should be more responsive as all
loaded elisp code is now compiled natively.

At the moment I see myself keeping the build script up to date and working for
some time, probably even until native-comp hits a stable release for macOS.

## Native comp, worth it?

Personally I'm getting massive improvements to overall GUI performance, to the
point I'm not sure I'd ever be able to go back to not having native-comp.

Emacs 27.x's native JSON library already improved `lsp-mode`'s performance by a
large margin, and with native-comp it's even faster for me now. To the point
that its suggestions are so instant they're actually getting in the way when I
try to use and expand snippets from `yasnippet`. I might need to increase my
suggestion delay from 0s.

Also scrolling long buffers with a mouse wheel — despite still being text/line
based — is actually a pretty nice and performant experience now, compared to a
very slow and sluggish experience to the point I typically preferred `C-v` and
`M-v` as they don't lag.

So yes, in my experience, native-comp is definitely worth it.

## Updates

- **2020–10–04:** The patched `gcc` Homebrew formula is no longer needed, and
  instead the script uses the newly released `libgccjit` formula, along with the
  standard `gcc` one.
