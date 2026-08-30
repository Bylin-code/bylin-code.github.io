---
layout: project
gallery_style: hero
gallery_count: 7
gallery_flip: false
title: "STRADEX"
description: "A violin-style MIDI controller using force-sensitive keys and a resistive strip to generate pitch bends, vibrato, and expressive dynamics."
date: 2025-09-03
featured: true
display: true
role: "Maker"
skills: "CAD, PCB design, Embedded development, Rapid prototyping"
thumbnail: "/assets/images/my-projects/stradex/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/stradex/stradex3.jpg"
    caption: "Stradex1, held in playing position"
  - image: "/assets/images/my-projects/stradex/stradex7.jpg"
    caption: "Full CAD model, including the PCB inside OnShape"
  - image: "/assets/images/my-projects/stradex/stradex8.jpg"
    caption: "CAD model of the key, designed to be easily assembled with only 3D printed parts"
  - image: "/assets/images/my-projects/stradex/stradex11.jpg"
    caption: "Some of the previous iterations of the keys, improved upon over time"
  - image: "/assets/images/my-projects/stradex/stradex10.jpg"
    caption: "A breadboard prototype of the circuitry, used for pre-pcb testing"
  - image: "/assets/images/my-projects/stradex/stradex13.jpg"
    caption: "Schematic of Stradex"
  - image: "/assets/images/my-projects/stradex/stradex14.jpg"
    caption: "PCB design of Stradex"
---
I’ve always wanted to put my violin skills to use in a MIDI environment, but there really isn’t a controller on the market that can emulate the feel of a violin to the extent that Stradex does.

Stradex features a SoftPot linear resistor to emulate the violin’s fingerboard, four custom force-sensitive keys to emulate the strings, and three potentiometers for range & modulation control. This setup allows Stradex to generate pitch bends, vibrato, dynamic expression, and incredible range, all while remaining intuitive for the average string player.

This project took me a good while. Sure, there was a lot of time spent fiddling with faulty ADS1115 chips and iterating on key designs, but most of the head-scratching was in the embedded firmware—namely, the MIDI signal interface. Many digital signal filtering and processing techniques had to be employed, including buffering, low-pass filtering, digital hysteresis, and numerous serial optimizations to ensure the controller intelligently decided when to send MIDI signals and when to ignore them.

I’m currently developing a component-level PCB version of STRADEX, which should reduce manufacturing costs in the long run.

Build Video & Demo:

  {% include youtube.html id="0cMQYN_HLao" %}

This project is fully open-sourced. If you want to build one for your self: [Stradex1 GitHub](https://github.com/Bylin-code/Stradex1/tree/main)

Also featured on [Hackaday](https://hackaday.com/2025/10/07/a-childhood-dream-created-and-open-sourced)
