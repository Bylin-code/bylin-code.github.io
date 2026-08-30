---
layout: project-5p
title: "KERMIT"
description: "A low-level computer vision line following robot. Final project for graduate-level mechatronics course. Won first place."
date: 2025-05-08
featured: true
display: true
role: "Engineer & Designer"
skills: "Pico C SDK, Embedded development, Computer vision, PID, Mechatronics, CAD, 3D Printing"
thumbnail: "/assets/images/my-projects/kermit/kermit8.jpg"
gallery:
  - image: "/assets/images/my-projects/kermit/kermit1.jpg"
    caption: "KERMIT looking at you with his froggy eyes"
  - image: "/assets/images/my-projects/kermit/kermit6.jpg"
    caption: "KERMIT's actual eyes, an OV7670 camera module"
  - image: "/assets/images/my-projects/kermit/kermit2.jpg"
    caption: "KERMIT's electronics on a breadboard."
  - image: "/assets/images/my-projects/kermit/kermit9.jpg"
    caption: "Schematics in KiCAD"
  - image: "/assets/images/my-projects/kermit/kermit11.jpg"
    caption: "CAD assembly"
---

**KERMIT** is a low-level computer vision line following robot that I built as the final project for a graduate-level mechatronics class. The project won first place in the class competition for the fastest robot to go one loop around the course.

KERMIT is powered by dual belt-driven DC motors, controlled by a Raspberry Pi Pico running firmware written in the C SDK. A simple PID controller is used to maintain a constant distance from the line, while a camera mounted on the front of the robot captures the horizontal position of the line and sends it to the Pico over I2C. 

The firmware averages the captured image into a line of pixels, it then calculates the center of mass of the line's brightness and uses that to calculate the error for the PID controller.











