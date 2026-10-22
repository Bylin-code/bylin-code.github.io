---
layout: project
collaboration: "Team"
project_type: "Personal Project"
gallery_style: editorial
gallery_count: 7
gallery_flip: false
title: "PULSE"
description: "A six-armed robot drummer built with Teensy and RasPi, integrating MIDI velocity curves, servo actuation, and synced stepper motion control."
date: 2025-06-12
featured: true
display: true
role: "Lead Engineer"
contributions: ["Electronics design", "Software development", "Creative", "Leadership"]
skills: "Engineering management, CAD, Machining, Sheet-metal fabrication, Waterjetting, 3D Printing, Laser cutting, Embedded design, Linux, Teensy RTOS, Firmware development, Electromechanical systems, Mixed-rail power management, Hardware debugging"
thumbnail: "/assets/images/my-projects/pulse/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/pulse/pulse18.jpg"
    caption: "Clear view of PULSE's mechanical and electrical components"
  - image: "/assets/images/my-projects/pulse/pulse7.jpg"
    caption: "My team and I after PULSE's debut performance"
  - image: "/assets/images/my-projects/pulse/pulse19.jpg"
    caption: "Full CAD assembly with 100+ parts all eventually fabricated and integrated with the electronics."
  - image: "/assets/images/my-projects/pulse/pulse4.jpg"
    caption: "Rows of drummer arm units that just went through the assembly line."
  - image: "/assets/images/my-projects/pulse/pulse3.jpg"
    caption: "An early conceptual sketch I used to pitch PULSE to my team and to NU's faculty"
  - image: "/assets/images/my-projects/pulse/pulse20.jpg"
    caption: "Ultra high-tech state-of-the-art sheet-metal manufacturing methods"
  - image: "/assets/images/my-projects/pulse/img-4843.jpg"
    caption: "PULSE without the drums"
---
**PULSE** is the first project for the Creative Engineering and Robotic Arts Studio (CERAS) at Northwestern University, a group I founded near the end of Freshman year. Our goal is to challenge the utilitarian nature of engineering and robotics and to explore the intersection of art and technology.

### My contribution

I founded CERAS and led PULSE’s engineering direction. I owned the schematics and most of the firmware controlling the stepper motors and servos. I also wrote a Python script that used automated test routines to estimate differences in strike delay across MIDI note velocities, supporting timing calibration for expressive playing.

My teammates did most of the mechanical CAD and wiring. I coordinated that work with the electronics and firmware as we brought the robot together.

### Keeping the performance in sync

PULSE has six servo-actuated arms, two solenoid-actuated kicks, and three stepper motors on a welded stainless steel base, plus speakers and an LCD face. A Raspberry Pi running Linux handles high-level commands and communicates with the Teensy over I2C. The Teensy runs an RTOS to coordinate the servos, solenoids, and steppers, keeping their timing synchronized during a performance.

<h3 id="demo">Watch PULSE play</h3>

{% include youtube.html id="hYe45-qbswQ" title="PULSE robot drummer playing a musical passage" %}

[Watch the performance on YouTube →](https://youtube.com/shorts/hYe45-qbswQ)
