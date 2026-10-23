---
layout: project
collaboration: "Team"
project_type: "Internship Project"
gallery_style: split
gallery_count: 4
gallery_flip: false
title: "HUMANOID CONTROLS"
description: "Arm integration, Ethernet teleoperation, and headset-driven neck controls."
featured: true
display: true
date: 2026-09-08
role: "Controls Engineer — Mundane Systems Inc."
contributions: ["Software development"]
skills: "C++, Python, ROS 2, Pinocchio, URDF, CAN, Gravity compensation, PD control, Hardware integration"
thumbnail: "/assets/images/my-projects/teleoperation-controls/orange-robot-front-thumbnail-v2.png"
gallery:
  - image: "/assets/images/my-projects/teleoperation-controls/neck-tuning-cropped.png"
    caption: "Tuning the Damiao-actuated neck at my desk"
    aspect_ratio: "1046 / 917"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/single-joint-teleoperation.png"
    caption: "My first single-joint teleoperation test with CAN FD-controlled HighTorque actuators"
    aspect_ratio: "1920 / 1242"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/arm-gravity-compensation.png"
    caption: "Testing gravity compensation on the new arm prototypes for the first time"
    aspect_ratio: "1124 / 808"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/leader-arm-teleoperation-cropped.png"
    caption: "Teleoperating with the leader arms I helped bring up"
    aspect_ratio: "1056 / 748"
    fit: contain
---
At Mundane Systems, I helped bring new robot arms into the existing leader–follower system and tuned the headset-driven neck.

### Arm bring-up

- Integrated URDFs and calibrated joint mappings, encoder directions, offsets, and torque limits for the new seven-DOF HighTorque arms.
- Tuned Pinocchio gravity compensation through single-joint and full-arm float tests, supporting 1 kHz local control over CAN FD.
- Characterized Coulomb friction and developed compensation profiles; some joints still needed validation.

### Ethernet teleoperation

- Configured cross-machine ROS 2 communication, clock synchronization, and launch and diagnostic tools.
- Restored leader–follower tracking by fixing false dropout detection and holding the latest ~100 Hz reference between updates to the 1 kHz local controller.
- Added command-age checks to reject stale references and a controlled transition to a held pose on link loss.

### Headset-driven neck

- Converted headset orientation into calibrated joint targets for the three-DOF Damiao neck.
- Tuned PD control, orientation smoothing, and velocity/acceleration limits for smoother motion.
- Fitted sinusoidal gravity feedforward and built calibration and motion-logging tools.

[Watch the public customer demo at NECA 2026 on LinkedIn →](https://www.linkedin.com/posts/amg-custom-controls_neca2026-activity-7513673525459742721-aaKm)
