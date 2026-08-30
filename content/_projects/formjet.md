---
layout: project-3p
title: "FORMJET"
description: "A safer all-in-one solution to SLA 3D printing post-processing, with a FormWash + water-washing sequence and UV curing."
date: 2026-02-01
featured: true
display: true
role: "Mechatronics Engineer"
skills: "Arduino, C++, Onshape CAD, System Integration, Teamwork + Leadership"
thumbnail: "/assets/images/my-projects/formjet/formjet4.jpg"
gallery:
  - image: "/assets/images/my-projects/formjet/formjet4.jpg"
    caption: "Side view of the electronics, the UV light is curing"
  - image: "/assets/images/my-projects/formjet/formjet1.jpg"
    caption: "The team"
  - image: "/assets/images/my-projects/formjet/formjet3.jpg"
    caption: "Front View, after a wash"
---
**FORMJET** is a hackathon project my team and I built in 48 hours to tackle one painfully familiar problem: the messy, multi-step post-processing workflow of SLA 3D printing. In this project, I owned the design and implementation of all electronics and embedded firmware, and also supported my teammates with CAD, mechanical design, and overall systems integration.

SLA (stereolithography) produces parts by selectively curing liquid resin layer-by-layer. Because print speed is primarily limited by Z-axis motion and resolution is driven by a high-resolution LCD, SLA is an excellent method for producing large batches of highly detailed parts. The bottleneck, however, is post-processing: multiple cycles of washing in isopropyl alcohol, rinsing, drying, heating, and UV curing. It’s slow, messy, and not especially safe to do in a typical workspace.

FORMJET compresses this entire workflow into a single, automated station while improving safety and usability. We wanted to eliminate open tanks of IPA, so we instead explored using Formlabs’ FormWash solution. While safer, this solution is not widely adopted because it leaves behind a slimy residue that’s difficult to remove when parts are simply submerged.

To solve this, we designed a shower-style washing system. I built the fluid control system using a pump and solenoid-actuated ball valves to seamlessly switch between FormWash solution and clean water, allowing residue to be rinsed off in one continuous process. Mechanically, the part is mounted on a two-axis stepper-driven system: the nozzle traverses the Z-axis while the part rotates, ensuring uniform coverage from all angles.

After washing, an array of UV LEDs cures the part while it spins, helping it dry evenly and preventing pooling or streaking. I wrote the firmware to coordinate the pump, valves, stepper motors, and UV LEDs into a single automated wash-and-cure cycle, effectively turning what used to be a messy, multi-step manual process into a one-button operation.
