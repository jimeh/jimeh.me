---
title: "Concept: Decentralized Zero-Conf VPN"
description:
  "Imagine a new kind of VPN service which doesn't require any kind of
  configuration and magically just works without a central server."
date: 2011-01-06
tags: ["vpn", "peer-to-peer", "technology"]
image:
  src: ./harvey-abayasiri-VpLemecHS-4-unsplash.jpg
  size: wide
  aspect: 32/9
  objectPosition: top
  credit:
    text: Photo by Harvey Abayasiri on Unsplash
    href: https://unsplash.com/photos/geometric-triangular-pattern-on-a-curved-surface-VpLemecHS-4
---

Imagine a new kind of VPN service which doesn't require any kind of
configuration and magically just works without a central server.

## Who Am I?

Before I go on, I should point out that I have no background in network
infrastructure, P2P network development, or pretty much any of the specific
technologies this touches. My background lies in web development, and this idea
is based on my understanding of these technologies. As such, please point out
any errors, misconceptions or other issues you might find. But keep in mind,
this is simply an idea of a potentially awesome technology.

## The Idea

For a while now it's been bugging me how messy it can be to get a VPN up and
running. Or just getting setup through any means to gain remote access to
different computers. Yesterday I had an idea somewhat based on
[Hamachi](http://en.wikipedia.org/wiki/Hamachi_%28software%29) and
[BitTorrent](http://en.wikipedia.org/wiki/BitTorrent_%28protocol%29).

> Imagine a VPN service which instead of connecting to a central server, uses
> BitTorrent's
> [DHT](http://en.wikipedia.org/wiki/BitTorrent_%28protocol%29#Distributed_trackers)
> implementation to find peers which are part of the same "network", just like
> BitTorrent clients finds peers who have the same torrent. Once peers have been
> found, secure and encrypted connections are setup between the local machine
> and all remote peers, creating a Virtual Private Network across the Internet
> which in essence works a lot like Apple's Bonjour technology; Everybody talks
> directly to everybody.

## The Details

I believe the concept is rather simple, but implementing it could be another
story. From a functionality point of view, these are some of my initial
ideas/notes:

- The networks you are connected to are managed by "key files", containing 1) a
  random unique hash string which identifies the network when the client
  searches for peers via DHT, and 2) an encryption key (or a set of encryption
  keys), which are used to encrypt all traffic between peers.
- Create a network: You generate a new key file which is populated with a random
  hash signature and encryption keys for you automatically. Somewhat like how
  SSH keys are generated.
- Join a network: You simply copy the key file from one computer to another. The
  second computer will find the first computer via DHT and start communicating
  with it automatically.
- PEX (Peer Exchange) can also be used to faster discover all peers in your
  Network. Meaning once you find one peer via DHT, it will tell you about all
  peers it knows about.
- Once peers are connected to each other, Apple's Bonjour technology (or
  something similar) could be used to get around potential IP conflicts and the
  like.
- In theory, the VPN client could behave just like a BitTorrent client when
  searching for peers via DHT. Once a peer is found however, it uses it's own
  protocol to setup a secure VPN connection. This could allow us to take
  advantage of BitTorrent DHT nodes already online, effectively piggybacking on
  BitTorrent users.
- Everything should be open source. Cause really, what's the point otherwise? :)

## Conclusion

To me, the coolest and most interesting point is piggybacking on existing
BitTorrent DHT nodes. If this is something BitTorrent client developers will
consider evil, I don't know.

That's why I'm writing this post. I'm hoping to get some feedback, suggestions,
insults, and ideas from people who are smarter, and know a lot more about these
kind of technologies than I do.

In terms of an actual implementation, personally I would love to build this
thing. But my networking and low-level programming skills are not very great at
all, it would take some time before I could have anything presentable. But if
someone else might be interested in starting it, I would very much like to be
part of the effort, in any way I can till I've gained the required skills.
