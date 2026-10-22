---
layout: project
collaboration: "Solo"
project_type: "Personal Project"
gallery_style: hero
gallery_count: 7
gallery_flip: false
title: "YAPPL"
description: "A mushroom-shaped voice journal with reminders and a self-hosted dashboard."
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
I never stuck with journaling, so I built a mushroom to nag me about it. YAPPL sits on my nightstand, gets impatient when I miss an evening, and starts recording when I press its cap.

I designed the 3D-printed enclosure and screwless inner chassis around an ESP32S3, microphone, expressive OLED eyes, and reminder lights. Audio streams over Wi-Fi to my home server for local transcription with whisper.cpp. A self-hosted dashboard organizes recordings and transcripts, with optional AI summaries and recurring-topic tracking.

Every entry preserves my original voice. The summaries help me browse; the recordings are what I want to keep.

[Software, CAD, and bill of materials →](https://github.com/Bylin-code/Yappl)

Build Video & Demo:

{% include youtube.html id="9kdt7UeWWE8" %}
