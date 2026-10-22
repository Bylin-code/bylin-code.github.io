---
layout: project
collaboration: "Solo"
project_type: "Internship Project"
gallery_style: split
gallery_count: 3
gallery_flip: false
title: "ACTUATOR TEST BENCH"
description: "An automated bench for comparing 50+ robotic joint actuator models."
date: 2026-05-26
featured: true
display: true
role: "Mechatronics Engineering Intern — Mundane Systems Inc."
contributions: ["Mechanical design", "Software development"]
skills: "Mechanical design, Design for CNC, Controls, CAN FD, RS-485, Test automation, Web development"
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
I built an automated test bench at Mundane Systems to compare 50+ actuator models from more than 10 suppliers for our next-generation arms. I owned the mechanical design, assembly, driver integration, test automation, and analysis.

### One bench, different actuator protocols

Each supplier used its own CAN protocol. I developed the drivers needed to bring those different actuator families into a common test workflow, with CAN FD and RS-485 communication across the setup. The 50+ figure refers to actuator models, rather than individual test units.

### Mechanical design and test automation

- **Mounting and alignment:** designed adjustable mounts and custom CNC parts to align different motors with a torque sensor and hysteresis brake.
- **Test coverage:** automated 10+ tests covering torque, position accuracy, speed, and loading.
- **Brake conditioning:** developed a decaying-sinusoid demagnetization routine to address residual magnetism between tests.
- **Results workflow:** built a web interface for browsing test histories and comparing actuator performance.

### Engineering outcome

The evaluation helped the team select HighTorque actuators for the new arms. Estimated hardware costs were $4,000–$5,000, compared with roughly $35,000 for a commercial rig; this is a hardware-cost comparison, not a claim of equivalent specifications or certification.

Detailed test data and performance comparisons remain internal to Mundane Systems.
