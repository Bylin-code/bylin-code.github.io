---
layout: project
project_type: "Internship Project"
gallery_style: split
gallery_count: 3
gallery_flip: false
title: "ACTUATOR TEST BENCH"
description: "A modular motor test bench with automated controls and a results dashboard, built to compare 50+ actuators for next-generation robotic arms."
date: 2026-05-26
featured: true
display: true
role: "Mechatronics Engineering Intern — Mundane Systems Inc."
skills: "Mechanical design, CNC machining, Controls, CAN FD, RS-485, Test automation, Web development"
thumbnail: "/assets/images/my-projects/actuator-test-bench/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/actuator-test-bench/test-bench.jpg"
    caption: "The assembled bench and a selection of the joint actuators evaluated"
  - image: "/assets/images/my-projects/actuator-test-bench/motor-mount.jpg"
    caption: "A SteadyWin actuator secured in the adjustable mount and connected to the test shaft"
  - image: "/assets/images/my-projects/actuator-test-bench/results-dashboard.png"
    caption: "The results browser, showing torque variation across repeated revolutions and comparisons between test runs"
    fit: contain
---
During my internship at Mundane Systems, I was tasked with comparing 50+ actuators from 12 Chinese manufacturers for our next-generation robotic arms. Our existing Damiao units showed uneven gearbox resistance and inconsistent torque estimates, which made smooth teleoperation harder. Alongside torque performance, replacements needed CAN FD support for our 1,000 Hz haptics control stack. Candidates included SteadyWin, HighTorque, Encos, and Motorevo.

A commercial torque-testing bench from US suppliers would have cost around $35,000. Since we only needed to test CAN-controlled BLDC planetary joint actuators, I researched existing bench designs and developed a more focused setup. We estimated about $3,000 for the core equipment and another $1,000–$2,000 for custom parts. I owned the project from mechanical design and assembly through controls, test automation, and the results interface.

The bench combines a rotary torque sensor, hysteresis brake, programmable power supply, and custom CNC-machined parts on an optical breadboard. The mechanical challenge was keeping motors with very different dimensions securely aligned to the same shaft. I designed an adjustable sliding clamp and interchangeable mounting plates to accommodate different motor sizes and bolt patterns, coordinating with equipment suppliers and machine shops to verify the specifications.

Most of the work was in software. I wrote drivers for 10 actuator models; they shared the MIT protocol concept, but their binary encodings differed substantially. The automated pipeline coordinates motor commands over CAN FD with the brake’s programmable supply and torque sensor over RS-485. It runs more than 10 tests covering torque consistency, encoder resolution and position accuracy, torque-constant verification, speed and load effects, and behavior under axial and radial loading.

One stubborn issue was residual magnetism in the hysteresis brake after power-off. I wrote a demagnetization routine using a decaying sinusoidal excitation, but getting it working took three power supplies. The third supported the programming speed, voltage, current, and communication interface the routine needed.

I also built a web dashboard for browsing test histories and comparing actuator profiles, so the results were useful beyond individual recordings. After evaluating the 50+ actuators, the team selected HighTorque for the next-generation arms.
