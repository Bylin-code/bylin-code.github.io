---
layout: project
project_type: "Internship Project"
gallery_style: split
gallery_count: 4
gallery_flip: false
title: "ROBOT TELEOPERATION & CONTROLS"
description: "Bringing up next-generation robot arms, connecting leader and follower machines, and tuning headset-driven neck motion at Mundane Systems."
featured: true
display: true
date: 2026-09-08
role: "Controls Engineer — Mundane Systems Inc."
skills: "C++, Python, ROS 2, Pinocchio, URDF, CAN FD, Gravity compensation, PD control, Hardware integration"
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
During my internship at Mundane Systems, I worked on the controls and hardware integration behind the robot’s arms and neck. My work ranged from getting individual actuators moving to tuning full-arm compensation and making the existing leader–follower control stack work across two machines.

### Bringing up the new arms

The next-generation arms used HighTorque actuators, with seven joints and a gripper on each arm. I helped integrate them into the existing system and worked through calibration on the physical hardware.

- **Models and configuration:** integrated the new URDFs and actuator configurations, including joint mappings, encoder signs, offsets, torque limits, and deployment settings.
- **Gravity compensation:** brought up and tuned Pinocchio-based compensation, checking predicted torques against physical behavior and adjusting per-joint scales through individual-joint and full-arm float tests.
- **Friction compensation:** ran velocity-sweep experiments and worked on fitted Coulomb-friction coefficients and compensation profiles. This was separate from the gravity model, with calibration and validation still in progress for some joints.
- **Actuator communication:** supported the 1 kHz local arm-control loop over HighTorque CAN FD, including aggregate motor-command frames and hardware deployment settings.

### Connecting leader and follower

I made the existing ROS 2 position-reference path usable between leader and follower machines over Ethernet, then tested tracking on the hardware.

- Configured Ethernet connectivity, clock synchronization, ROS discovery and domain settings, and cross-machine deployment.
- Added preflight checks, launch and stop tools, and diagnostics for latency and timing variation.
- Tuned operating profiles and motion thresholds from hardware traces, and worked through gripper-reference and startup issues.

One consequential bug came from the difference between the **roughly 100 Hz network reference stream and the 1 kHz local controller**. The follower treated normal gaps between reference messages as dropouts, repeatedly resetting its transition offset and suppressing tracking. I fixed the gap handling so the controller could hold the latest target between network updates, and documented two-machine tracking tests.

This path implemented position tracking; returning follower contact torque to the leader for bilateral force feedback remained future work.

### Tuning headset-driven neck motion

I also worked on the robot-side controls for the three-DOF, Damiao-actuated neck, translating headset orientation into smoother joint motion.

- **Orientation mapping:** integrated headset quaternions with neutral-orientation calibration, coordinate conversion, home offsets, and joint-target limits.
- **Motion smoothing:** applied a critically damped orientation filter, velocity and acceleration limits, and a braking curve near the target.
- **PD tuning:** tuned position control with zero velocity feedforward, allowing derivative gain to damp measured motion without introducing noise from differentiated targets.
- **Gravity feedforward:** fitted sinusoidal torque compensation to address gravity-induced position error and stiction-related lurching.
- **Calibration tools:** worked on gravity fitting, range-of-motion measurement, gear-ratio checks, homing, and motion logging.

Together, these contributions connected actuator-level bring-up with whole-system operation: calibrated arms, cross-machine position tracking, and headset-driven neck control.

[Check out our customers testing the system at NECA 2026 →](https://www.linkedin.com/posts/amg-custom-controls_neca2026-activity-7513673525459742721-aaKm)
