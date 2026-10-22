---
layout: project
project_type: "Personal Project"
gallery_style: hero
gallery_count: 7
gallery_flip: false
title: "YAPPL"
description: "A mushroom-shaped voice journal with OLED expressions, evening reminders, and a self-hosted journal dashboard."
date: 2026-10-02
featured: true
display: true
role: "Maker"
skills: "CAD, 3D printing, Electronics, Embedded development, Full-stack development"
thumbnail: "/assets/images/my-projects/yappl/thumbnail.jpeg"
gallery:
  - image: "/assets/images/my-projects/yappl/cad.jpg"
    caption: "Designing the inner chassis around the electronics"
  - image: "/assets/images/my-projects/yappl/sketch.jpg"
    caption: "The original mushroom-shaped concept, complete with googly eyes"
  - image: "/assets/images/my-projects/yappl/breadboard.jpg"
    caption: "Breadboard prototype with the OLED, microphone, reminder LED, and buzzer"
  - image: "/assets/images/my-projects/yappl/yappl.jpg"
    caption: "Yappl, ready to hear about my day"
    fit: contain
  - image: "/assets/images/my-projects/yappl/eyes.jpg"
    caption: "A slightly impatient reminder to start journaling"
  - image: "/assets/images/my-projects/yappl/journal.jpg"
    caption: "The journal dashboard, with a timeline of entries and summaries of each day"
    fit: contain
  - image: "/assets/images/my-projects/yappl/memory.jpg"
    caption: "Keeping track of recurring people and places. Names and transcripts are anonymized."
    fit: contain
---
I never stuck with journaling, so I built a mushroom to nag me about it. Yappl—yapping meets journal—sits on my nightstand and reminds me to talk about my day before bed.

A Seeed Studio XIAO ESP32S3 drives an I2S microphone, a 1.5-inch OLED with expressive eyes, a light sensor, blue LEDs, and a piezo buzzer. After 8 p.m., if I haven’t talked to it in over 12 hours, it gets impatient. Pressing the cap starts recording, with no wake word or menu.

Audio streams over Wi-Fi to a Docker-based home server, keeping recordings off the ESP32’s limited memory. The server compresses the audio and transcribes it locally with whisper.cpp. An optional LLM creates titled, first-person summaries and tracks recurring people, places, and objects. A browser dashboard organizes entries in a GitHub-like timeline with summaries at different levels of detail. Running the LLM locally makes the whole setup self-hosted.

The enclosure uses a two-piece inner chassis for mounting and wiring the electronics without a custom PCB. It slides into the mushroom body without screws. The cap doubles as the button and lets reminder light shine out and ambient light reach the sensor.

Summaries help me scan a week, but in 20 years I’ll want to hear my own voice. Every entry preserves the recording and transcript; AI is optional. The point is to capture everyday memories before I forget them.

The software, CAD models, and bill of materials are open source: [Yappl GitHub](https://github.com/Bylin-code/Yappl).

Build Video & Demo:

{% include youtube.html id="9kdt7UeWWE8" %}
