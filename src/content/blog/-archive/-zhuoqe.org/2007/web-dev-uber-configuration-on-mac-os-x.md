---
title: "Web-Dev Uber-Configuration on Mac OS X"
description:
  "Mac OS X is an excellent web-development platform if you ask most (except if
  you ask Windows fanatics). It's UNIX based, comes with Apache 1.3
  pre-installed..."
date: 2007-02-18
slug: web-dev-uber-configuration-on-mac-os-x
archive: zhuoqe.org
updatedDate: 2007-05-07
tags: ["development", "mac-os-x", "php"]
---

Mac OS X is an excellent web-development platform if you ask most (except if you
ask Windows fanatics). It's UNIX based, comes with Apache 1.3 pre-installed and
ready to rock 'n' roll basically. But the default factory settings for Apache
and more generally don't fill all the requirements of the average web-developer,
so you change settings, install this, install that, customize a few more things,
and before long you're not sure what you did and where sometimes. And this
becomes a problem if/when it comes time to reinstall OSX on your little baby, or
simply when your old baby is to old and ugly and you throw it out the window
from the 4th floor head first in favor of a brand new and cute little baby.
\*evil grin\*

Whatever the reason, it's always a pain in the ass to reinstall a system,
specially when you've installed and reconfigured a lot of background daemons and
services. Hence I thought I'd share my method of configuration which makes it
quite easy just lifting it all from one system to another.

What I'm gonna outline here is installing PHP 5, MySQL and additional tools, and
reconfiguring apache the way I've done it.

So lets start by downloading PHP 5 for your system from here:
<dead+http://www.entropy.ch/software/macosx/php/>

It's a no brainer, just extract the `tar.gz` archive and double click the `.pkg`
installer package and follow instructions. This will leave you with a working
PHP install located in `/usr/local/php5/`.

Then lets move on to MySQL, download the package for your system here:
<dead+http://mysql.org/downloads/mysql/5.0.html#Mac*OS_X*(package_format)>

Again, its an easy `.pkg` installation. Optionally, you can install the
preference pane which is an easy way to start and stop MySQL. If you want the
MySQL daemon to run at system startup, use the `.pkg` startup item installer, as
the option in the preference pane doesn't seem to work at all :P

The MySQL GUI Tools are very useful, and are available here:
<dead+http://mysql.org/downloads/gui-tools/5.0.html#OSX>

As for Apache, there's a few things to do, first of all you should make sure
you've turned on “Personal Web Sharing” under the Sharing preference panel in
System Preferences. Next we're gonna add a single line to Apache's configuration
file. Use any text editor of your choice, to open `/etc/httpd/httpd.conf`, you
can use the terminal based pico editor by running this in a terminal:

```sh
sudo pico /etc/httpd/httpd.conf
```

Then right at the bottom of the file, add the following on a new line (if you're
using pico, you can quickly scroll down using ctrl+v):

```apache
Include /Users/username/Library/httpd/*.conf
```

Obviously, make sure to replace `username` with your own username. The idea here
is that we have apache automatically include all `.conf` files located in your
own `~/Library/httpd/` folder.

Now, before we do anything else, I recommend you open your `~/Sites/` folder
with the finder, create a new folder called `_public`, and move everything
inside your Sites folder into the newly created `_public` folder. We're gonna
reconfigure your `_public` folder to be Apache's root directory rather than
`/Library/WebServer/Documents`.

Then open the `~/Library/` folder in your home folder, and create a folder named
`httpd`, in there lets create `_main.conf`, and put this in it (the `Listen`
settings you don't really need unless you want them):

```apache
DocumentRoot "/Users/username/Sites/_public"
Listen 80
Listen 3000
Listen 8080
```

Again, replace `username` with your own username. Save the file, and run the
following command in the terminal and enter your password when asked to relaunch
Apache.

```sh
sudo apachectl graceful
```

Open [`http://localhost/`](http://localhost/) in a web browser, and you should
see the contents of your own `_public` folder :)

Then you can continue to create an `aliases.conf`, `virtual_hosts.conf` and more
in `~/Library/httpd/` and apache will automatically include them. This way, you
only need to do a single modification to the bottom of `httpd.conf` on any new
system aswell, and just place your config files in the correct dir, and you're
ready to rock 'n' roll ;)

What I've also done myself, is that I create virtual hosts for the different
projects I'm working on. So lets say I've got a new project now called “Banjo”,
then I would create `~/Sites/banjo/` and I'd create a virtual host entry in
`virtual_hosts.conf` that looks like this:

```apache
<VirtualHost *:80>
&nbsp;&nbsp;&nbsp;ServerName banjo
&nbsp;&nbsp;&nbsp;DocumentRoot "/Users/username/Sites/banjo"
</VirtualHost>
```

Then I open `/etc/hosts` with a text editor, and I create a new entry which
looks like this:

```text
127.0.0.1 banjo
```

Once all is saved and done, I restart Apache with `sudo apachectl graceful`,
open [`http://banjo/`](http://banjo/) in a web browser, and I'm all set to
create another world dominating merciless enemy business killing machine of a
site... Heh

Myself I've got [phpMyAdmin](http://www.phpmyadmin.net/) installed in
`~/Sites/_public/mysql/`, which makes it accessible at
[`http://localhost/mysql/`](http://localhost/mysql/). Also, I have a virtual
host configured, and a entry in the hosts file so I can also access from
[`http://mysql/`](http://mysql/) :D

Then of course, I use [TextMate](http://www.macromates.com/), and I've got a
TextMate project with all the Apache and PHP configuration files, which I can
quickly open using [Quicksilver](dead+http://quicksilver.blacktree.com) by
pressing cmd+space and typing `httpd` and pressing return cause the project file
is called `httpd`. But the rest of my workflow is a story for another time ;)

I hope some of you have found this useful, saionara fili moy...
