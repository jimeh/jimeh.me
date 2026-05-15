---
title: "Fix for the never-ending Apple logo during iPhone boot problem"
description:
  "So, the last few days, I've had a quite weird issue with my iPhone. It locks
  up, and after a force reset, it never does anything else than showing the
  Apple..."
date: 2008-08-30
slug: fix-for-the-never-ending-apple-logo-during-iphone-boot-problem
archive: zydev.info
updatedDate: 2008-09-28
tags: ["iphone"]
---

So, the last few days, I've had a quite weird issue with my iPhone. It locks up,
and after a force reset, it never does anything else than showing the Apple
logo. However, it does connect to Wifi for about 5 minutes so i can SSH into the
phone.

So far, I've been resetting the phone from scratch, but with help from eric in
\#iphone on irc.saurik.com I managed to figure out a solution.

For now I'm just gonna write up the steps required to fix it. I'll update the
post later with details of why and how this happens.

## The Fix

First of all, your phone still has to connect to your wifi network so you get
SSH access, even tho it's still only displaying the Apple logo. It will probably
disable wifi after about 5 minutes, so you gotta move faster than a snail at
least.

Don't try this if you don't know what you're doing. Also, this is for the
2.0/2.1 iPhone software, but might also work on 1.x.

1. SSH into the phone as `root`, cd to `/System/Library/SystemConfiguration/`
   and rename `mobilewatchdog.bundle` to `mobilewatchdog.bundle_x`.

2. cd to `/private/var/mobile/Library/Caches/` and remove any files which names
   begin with `com.apple.mobile.installation`.

3. Reboot the phone, and like magic it should start up like normal, in 2-15
   minutes depending on how many apps you have installed.

4. SSH in again and rename the `mobilewatchdog.bundle_x` folder back to
   `mobilewatchdog.bundle` in `/System/Library/SystemConfiguration/`, and
   reboot.

## The Cause

The problem's root is a combination of how App Store apps are stored on the
phone, and a safety process called mobilewatchdog which ensures that the
Springboard doesn't lock up.

Myself, I've mainly had it triggered by installing an app with Cydia which has a
Springboard icon. As you surely have noticed, Cydia on iPhone software 2.0.x
doesn't need to restart the Springboard anymore for new applications to show. It
seems to use a similar method as the App Store to dynamically create new
application icons.

The problem is that sometimes when Cydia adds an application icon, the
Springboard flips out and loses its cached list of installed applications. That
list is required cause the App Store apps are stored in their own little sandbox
protected folders, which means that it's a bit more complicated than just
getting a directory listing to see which applications are installed. And it
takes some time to scan for all installed applications.

And that's where the problem starts. There's a background daemon called
mobilewatchdog, who's sole purpose is to make sure that the Springboard does not
crash or lock up. In the event of the Springboard locking up or crashing,
mobilewatchdog will force quit and relaunch it. Sounds good right? Right, as
long as the Springboard doesn't have to rescan for installed applications.

As it seems, when the Springboard scans for applications, it's too busy to
respond to mobilewatchdog's checks. And mobilewatchdog being very impatient,
only waits 2 seconds for an answer from Springboard. So if it doesn't get a
response within 2 seconds, it force quits the Springboard and relaunches it. At
this point, Springboard just starts rescanning for installed applications again
and gets to busy to respond to mobilewatchdog again, and the circule continues
for all eternity.

So the solution was pretty obvious. Disable mobilewatchdog temporarily so
Springboard get's time to find all installed applications. I originally tried
some plist configurations as was suggested by syslog dumps from the
mobilewatchdog daemon itself, they didn't work tho. So being desperate, and
crazy, I simply renamed the mobilewatchdog bundle rendering it unusable, hoping
that its launched simply based on file name, and nothing else fails due to it
referencing it. Luckily enough, it works.

Springboard was given enough time to find all my installed applications and
launch like normal. It had however missed a few apps, so I went looking for the
cached list of installed apps, which was where I expected it to be. In
`/private/var/mobile/Library/Caches/`. Removing the cache files forces
Springboard to scan for apps again, and with mobilewatchdog out of the picture,
it works perfectly.

I've only tested this on 2.0.2, but should be exactly the same for all 2.0.x
software. I've tested this on both 2.0.2 and 2.1 with success. I have had the
same issue on 1.1.4 tho when using Installer. However, I don't know if its the
same issue or not. If this happens to work for the same issue on 1.x, please let
me know :)

It was thanks to eric in \#iphone on irc.saurik.com that i figured out this
solution. He had previously had this issue, and worked with saurik to figure out
what was going on. Without being pointed in the right direction, I wouldn't have
had a clue of where to start, and just ended up swearing my head off and
resetting my iPhone yet again.
