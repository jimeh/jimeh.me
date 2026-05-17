---
title: "Automated Profile Picture Update Service?"
description: >-
  A universal profile-picture updater sounds useful, but probably falls apart on
  trust and platform quirks.
date: 2010-02-05
slug: automated-profile-picture-update-service
tags: ["technology", "social-media", "avatar"]
archive: true
image:
  src: ./luthfi-alfarizi-gEf9bOMTZtk-unsplash.jpg
  aspect: 32/9
  size: wide
  objectPosition: 50% 40%
  credit:
    text: Photo by Luthfi Alfarizi on Unsplash
    href: https://unsplash.com/photos/gEf9bOMTZtk
---

After I updated my [profile picture](/blog/2010/new-avatar-same-old-fugly-face/)
today, a friend of mine
[responded](http://twitter.com/jonromero/status/8655908664) with:

> Build a service that changes your profile picture in all social networks!

My first response was "Gravatar?". Obviously he didn't mean Gravatar, I just
mentioned it to annoy him.

A service which automagically just updates your Facebook, Twitter, Flickr,
YouTube, Vimeo, Gravatar, _…_ profile pictures would be quite cool. Thinking
about it a bit more, there are three problems with building such a service:

- A lot of these sites you will need to crawl programmatically using some kind
  of web-crawler library. It will be a pain to write, and even bigger pain
  whenever they change anything in the HTML layout of their pages.
- Some sites have specific and/or strange restrictions for image dimensions,
  file size, and even file format.
- Will people actually trust such a service with passwords for all of their
  online social networking accounts?

The later problem, trust, is definitely the biggest one. And I'm not sure you
could overcome it unless the service is officially sponsored and/or operated by
Google or somebody. I do think it could be a fun project to undertake, but I
think it's pretty doomed right from the start unfortunately. Although if I
updated my profile pictures more than once every 4-5 years, I might just build a
prototype for myself at least.
