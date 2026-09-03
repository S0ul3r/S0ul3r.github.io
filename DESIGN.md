---
name: Jakub Kulewicz Portfolio
description: Cinematic dark wireframe experience for a software engineer CV
colors:
  void: "#050505"
  ink: "#000000"
  fog: "#0a0a0a"
  line: "#f2f2f2"
  mute: "#d0d0d0"
  dim: "#9a9a9a"
  hairline: "rgba(255,255,255,0.28)"
  fill-ghost: "rgba(255,255,255,0.06)"
  send: "#565656"
typography:
  display:
    fontFamily: "Nanum Myeongjo, Palatino, serif"
    fontSize: "clamp(2.4rem, 6.4vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.18em"
  body:
    fontFamily: "Bitter, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  ui:
    fontFamily: "Lato, Segoe UI, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.18em"
rounded:
  none: "0px"
  sm: "4px"
  md: "10px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
  section: "0px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    rounded: "{rounded.md}"
    padding: "14px 36px"
  button-ghost-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.line}"
    rounded: "{rounded.md}"
    padding: "14px 36px"
  button-send:
    backgroundColor: "{colors.send}"
    textColor: "{colors.line}"
    rounded: "{rounded.sm}"
    padding: "12px 28px"
---

# Design

<!-- Direction contract
THESIS: The first viewport is a wireframe world you start, not a sticky CV sidebar.
OWN-WORLD: Charcoal void, film grain, thin white GL lines, Nanum Myeongjo wordmark with heavy initials, Bitter italic overlay nav, Lato chrome.
STORY: Start the scene, read the person, scan the work, flip through projects, write.
FIRST VIEWPORT: Centered wordmark over a glowing sun and rolling wire terrain; Start, then Get in Touch.
FORM: User-pinned to gustavobatista.dev craft; original scene, type, and motion.
-->

## Overview

Full-viewport dark experience. A fixed WebGL canvas sits behind grain and type. Chrome lives on the edges (equalizer, hamburger, section dots). Content is five snapped sections. After Start, the camera travels through the same world as the visitor scrolls.

## Colors

Near-monochrome. Ground is `#121212`, not pure black. Type is off-white and mid-gray. Tech tags may use the brand color of that tool. One functional green is reserved only if a CV file exists.

## Typography

Nanum Myeongjo for the wordmark (heavy first letters, lighter remainder). Bitter for almost everything else, including italic overlay links. Lato for Start, Send, and tiny chrome. Track the wordmark and the typed role tightly.

## Layout

Five `min-height: 100dvh` sections. Home is centered. About is a right column over a left-side bust in the 3D scene. Work is a six-up capability grid. Projects is a perspective carousel. Contact is a bordered form on the left. Overlay nav is a full-bleed italic stack.

## Elevation & Depth

No card chrome as the page system. Depth comes from the GL world, CSS `preserve-3d` project boxes, grain, and a single inner highlight on the Start control. Film grain is a fixed, non-scrolling overlay.

## Shapes

Hairline 1px strokes. Start uses a slightly rounded rectangle (~10% radius). Form fields are 4px. Overlay is sharp. Dots are circles.

## Components

Ghost Start / Get in Touch. Gray Send. Hamburger morphs to an X. Right-edge dots mark the section. Overlay lists Home, About, Work, Projects, Contact plus socials.

## Do's and Don'ts

Do honor reduced motion by freezing the scene and snapping without camera travel.
Do keep Jakub's factual copy.
Don't add an Awwwards badge, a playable game, or Gustavo's music/models.
Don't switch the page into a light theme mid-scroll.
Don't use Inter, Fraunces, or a neon accent.
