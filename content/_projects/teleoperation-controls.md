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
skills: "C++, Python, ROS 2, Pinocchio, URDF, CAN, Gravity compensation, PD control, Hardware integration"
thumbnail: "/assets/images/my-projects/teleoperation-controls/orange-robot-front-thumbnail-v2.png"
gallery:
  - image: "/assets/images/my-projects/teleoperation-controls/neck-tuning.png"
    caption: "Tuning the Damiao-actuated neck at my desk"
    aspect_ratio: "1046 / 1152"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/single-joint-teleoperation.png"
    caption: "My first single-joint teleoperation test with CAN FD-controlled HighTorque actuators"
    aspect_ratio: "1920 / 1242"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/arm-gravity-compensation.png"
    caption: "Testing gravity compensation on the new arm prototypes for the first time"
    aspect_ratio: "1124 / 808"
    fit: contain
  - image: "/assets/images/my-projects/teleoperation-controls/leader-arm-teleoperation.png"
    caption: "Teleoperating with the leader arms I helped bring up"
    aspect_ratio: "894 / 1148"
    fit: contain
---
At Mundane Systems, I helped bring new robot arms into the existing leader–follower system and tuned the headset-driven neck.

### Arm bring-up

- Integrated URDFs and calibrated joint mappings, encoder directions, offsets, and torque limits for the new seven-DOF HighTorque arms.
- Tuned Pinocchio gravity compensation through single-joint and full-arm float tests, supporting 1 kHz local control over CAN FD.
- Characterized Coulomb friction and developed compensation profiles; some joints still needed validation.

### Ethernet teleoperation

- Configured cross-machine ROS 2 communication, clock synchronization, and launch and diagnostic tools.
- Fixed a tracking bug where the 1 kHz controller mistook normal gaps in the ~100 Hz reference stream for dropouts. Holding the latest target between updates restored tracking.

### Headset-driven neck

- Converted headset orientation into calibrated joint targets for the three-DOF Damiao neck.
- Tuned PD control, orientation smoothing, and velocity/acceleration limits for smoother motion.
- Fitted sinusoidal gravity feedforward and built calibration and motion-logging tools.

[Check out our customers testing the system at NECA 2026 →](https://www.linkedin.com/posts/amg-custom-controls_neca2026-activity-7513673525459742721-aaKm)
