---
layout: project
project_type: "Internship Project"
gallery_style: split
gallery_count: 3
gallery_flip: false
title: "HAPTICS TEST RIG"
description: "A mechanical test platform for measuring how accurately a teleoperation system transmits force between its leader and follower."
date: 2026-06-20
featured: false
display: true
role: "Mechatronics Engineering Intern — Mundane Systems Inc."
skills: "Fusion 360, Mechanical design, DFM/DFA, GD&T, CNC machining, Hardware integration"
thumbnail: "/assets/images/my-projects/haptics-test-rig/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/haptics-test-rig/assembled-rig.png"
    caption: "The assembled test rig, with paired motors, carbon-fibre arms, load cells, and linear stages"
  - image: "/assets/images/my-projects/haptics-test-rig/exploded-cad.png"
    caption: "Exploded CAD view of the frame, motor mounts, and linear-stage assemblies"
  - image: "/assets/images/my-projects/haptics-test-rig/machined-parts.jpg"
    caption: "Custom CNC-machined aluminum parts, ready for assembly"
---
During my internship at Mundane Systems, our haptics team needed a reliable way to measure how well their teleoperation algorithms reproduced force feedback. Motor signals alone weren’t enough—we needed an independent measurement to compare the phase, amplitude, and shape of the response at the leader and follower. I designed the mechanical test rig that made those comparisons possible.

I started by spending a day with the haptics lead to pin down the torque range, measurement resolution, and test motions, along with mechanical effects that could distort the data. The resulting setup holds two identical motors on an aluminum-extrusion frame. Each connects through a long carbon-fibre arm and sliding-slot linkage to a load cell on a linear rail. The load cells measure force independently of the motors, providing an external reference for torque through the arm geometry.

For a test, the leader side is held fixed while a BLDC planetary gearmotor drives a lead screw on the follower’s linear stage. This applies motion to the follower at different frequencies, amplitudes, and waveforms. With the two motors connected by the team’s teleoperation and haptics software, the load cells capture both sides’ responses. Comparing those traces lets the team see where the feedback differs and evaluate changes to their algorithms.

The test actuator could introduce variation of its own. We considered brushed DC and stepper motors before choosing a BLDC planetary gearmotor, then characterized its torque over repeated rotations to understand the variation it could introduce into the measurements.

I owned the full mechanical design in Fusion 360, combining existing extrusions, linear rails, and lead screws with custom CNC-machined aluminum parts. I designed for manufacturing and assembly, prepared GD&T drawings for the machine shop, and helped integrate the finished mechanism with the team’s software. The haptics team owned the control algorithms and subsequent testing.

Completed in June 2026, the hardware was handed over and put into use for profiling haptics algorithms. It gave the team a repeatable physical setup and an independent force measurement on both sides of the system.
