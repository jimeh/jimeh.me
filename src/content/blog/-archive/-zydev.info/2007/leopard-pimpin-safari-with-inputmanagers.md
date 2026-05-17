---
title: "Leopard: Pimpin' Safari with InputManagers"
description:
  "We all heard the rumors that InputManagers were completely removed from
  Leopard. But thankfully as Allan Odgaard of Macromates points out in his blog,
  that's..."
date: 2007-11-02
slug: leopard-pimpin-safari-with-inputmanagers
archive: zydev.info
updatedDate: 2007-11-07
tags: ["mac-os-x"]
---

We all heard the rumors that InputManagers were completely removed from Leopard.
But thankfully as Allan Odgaard of [Macromates](http://www.macromates.com/)
points out in his
[blog](http://blog.macromates.com/2007/inputmanagers-on-leopard/), that's not
(quite) the situation.

To sum up, InputManagers still work, but not from the User's Library folder.
Only InputManager's located in _/Library/InputManagers/_ are loaded if they
belong to the _root_ user and _wheel_ group. Also if _~/Library/InputManagers/_
exists it seems that all InputManagers are ignored, but not in all cases.

My own personal favorites when it comes to pimpin' Safari are

[Inquisitor](dead+http://www.inquisitorx.com/),
[SafariStand](dead+http://hetima.com/safari/stand-e.html) and
[Saft](dead+http://haoli.dnsalias.com/Saft/index.html). Inquisitor and
SafariStand are completely free to download and use, Saft you have to pay for
tho (which I've been meaning to get around to for a few months now). All of
these three Safari extensions are available and work under Leopard now.

**Inquisitor** has been updated to automatically install directly into
_/Library/InputManagers/_. If it doesn't load after install, check if
_~/Library/InputManagers/_ exists in your home folder and trash it if it does.

**SafariStand** has a Leopard specific release, which for better or worse drops
support for the InputManager's loading technique, and instead relies solely on
[SIMBL](https://github.com/msolo/simbl/wiki). Previous versions could be used as
an InputManager directly, or loaded via SIMBL. Personally I hope that
InputManager support returns soon.

With Safari 3, SafariStand can replace one of the two features I like the most
from Saft. Automatically restore all open windows and tabs from previous
session. SafariStand has long had a restore feature, but (at least if i remember
right) it popped up a window first about it rather than just opening everything
again. Safari 3 though added a few feature under the History menu called
"Restore All Windows From Last Session", and SafariStand can automatically
invoke that function upon launch.

**Saft** seems to have gone a somewhat strange way to accomplish Leopard
compatibility tho. I was gonna give the demo another try since i did a clean
install of Leopard, the traces of the previous expired demo were all gone.
However, Saft is now packaged as an application you copy to _/Applications/_.
Then you launch Saft.app rather than Safari.app. The Saft application is
basically a launcher for Safari which injects the necessary code into Safari to
work.

Personally I find Saft's new approach quite annoying. Ok, so its not a major
deal launching Saft instead. But the thing is, that I shouldn't have to.
InputManager still work, SIMBL still works, there are options. But in all
fairness, Saft is probably the most complex of the three extensions I'm covering
here, and my guess would be that this was the fastest solution to get Saft back
up and running for their customers who have upgraded to Leopard. I'm hoping for
a future release which works like a normal InputManager, or in worst case, uses
SIMBL.

**\*UPDATE:** With the release of
[Saft 10.0.1](dead+http://haoli.dnsalias.com/Saft/Download/index.html) it can
now be used as an InputManager, or a launcher.\*

I'd just like to clear up that I don't hate SIMBL. I just find it unnecessary to
use one InputManager to load one that you actually want, while the one you
actually want could be loaded directly. Not optimal efficiency, and I
unfortunately happen to have a bit of an obsession about efficiency. \*whistles
innocently\*
