---
layout: project-3p
title: "HARPA"
description: "A robotic harp built on an Arduino Mega and a Leonardo. Strings actuated by servo array attched to silicone fingers."
date: 2022-09-29
weight: 4
featured: true
display: true
thumbnail: "/assets/images/my-projects/harpa/harpa1.jpg"
image: "/assets/images/gen/projects/project-1-2.webp"
role: "Building Designer"
skills: "Arduino, C++, MIDI signal processing, I2C, CAD, 3D Printing"
gallery:
  - image: "/assets/images/my-projects/harpa/harpa3.jpg"
    caption: "<strong>Fig 1:</strong> Side view"
  - image: "/assets/images/my-projects/harpa/harpa7.jpg"
    caption: "<strong>Fig 2:</strong> Close up on the electronics"
  - image: "/assets/images/my-projects/harpa/harpa1.jpg"
    caption: "<strong>Fig 2:</strong> HARPA under the blue sky"
---
**HARPA** is a self-playing harp I built over two weekends in the start of my junior year of highschool. My school commisioned me to build an acoustic structure that would be displayed by the makerspace and should "capture some eyeballs," thus, HARPA was born. 

21 servos are attached to an adjustable 2020 aluminum extrusion rail mounted on a 3D printed frame. Each servo has a hand-carved silicone plug designed to produce a pluck that sounds like that of a human finger. An Arduino Leonardo handles the MIDI signal processing while an Arduino Mega controls the servos with it's many PWM-enabled pins. The two MCUs communicate with each other over I2C.

HARPA is still standing in the makerspace and enternains visitors once in a while. Here's a link to a video of it in action:

<div class="video-container">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/jgN24XgvbMA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
