---
layout: project
collaboration: "Solo"
project_type: "Personal Project"
gallery_style: split
gallery_count: 3
gallery_flip: true
title: "ROBOTIC HARP"
description: "A robotic harp built on an Arduino Mega and a Leonardo. Strings are actuated by a servo array attached to silicone fingers."
date: 2023-01-01
featured: false
display: true
role: "Maker"
contributions: ["Mechanical design", "Electronics design", "Software development", "Creative"]
skills: "Arduino, C++, MIDI signal processing, I2C, CAD, 3D Printing"
thumbnail: "/assets/images/my-projects/robotic-harp/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/robotic-harp/robotic-harp3.jpg"
    caption: "Side view"
  - image: "/assets/images/my-projects/robotic-harp/robotic-harp7.jpg"
    caption: "Close up on the electronics"
  - image: "/assets/images/my-projects/robotic-harp/robotic-harp1.jpg"
    caption: "ROBOTIC HARP under the blue sky"
---
**ROBOTIC HARP** is a self-playing harp I built over two weekends in the start of my junior year of highschool. My school commisioned me to build an acoustic structure that would be displayed by the makerspace and should “capture some eyeballs,” thus, ROBOTIC HARP was born.

21 servos are attached to an adjustable 2020 aluminum extrusion rail mounted on a 3D printed frame. Each servo has a hand-carved silicone plug designed to produce a pluck that sounds like that of a human finger. An Arduino Leonardo handles the MIDI signal processing while an Arduino Mega controls the servos with it’s many PWM-enabled pins. The two MCUs communicate with each other over I2C.

ROBOTIC HARP is still standing in the makerspace and enternains visitors once in a while. Here’s a link to a video of it in action:

  {% include youtube.html id="jgN24XgvbMA" %}
