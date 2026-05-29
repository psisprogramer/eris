# ERIS

> Explore the geometry of the universe.

An interactive, immersive web prototype that teaches gravity, orbits and the curvature of space through simulation — not memorization. Designed for teenagers (12–15), built like cinematic science fiction, because fascination is the first teacher.

## Philosophy

ERIS is not a class. Not a dashboard. Not an edu-platform.

It is an **observation station**. The user is crew. Missions are not levels — they are tasks of a scientific expedition. When someone enters the prototype they should feel *"I am exploring the universe,"* and when they leave: *"I now understand intuitively how gravity works."*

## Stack

- **React 18** + **Vite 5** as the foundation.
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for all 3D work.
- **react-router-dom** for navigation between scenes.
- Custom GLSL shaders (procedural noise) for planet surfaces, atmospheres, rings and nebulae.
- Per-screen modular CSS, glassmorphism and holographic effects with no UI library.

## Running the prototype

```bash
cd eris
npm install
npm run dev
```

The browser opens automatically at `http://localhost:5173`.

## Architecture

```
src/
├── pages/         # Landing · Hub · Simulation · Debrief (the 4 screens)
├── scenes/        # SpaceBackground · HubScene · GravityScene · Planet (3D)
├── components/    # HoloPanel · HoloButton · Dial · ControlConsole · SideNav · ExperimentQuiz · MissionCard
├── hooks/         # useMissionProgress (Context) · useGravitySim (engine)
├── utils/         # physics.js — F = G·m₁·m₂/r²
├── data/          # missions.js — declarative scenario definitions
└── styles/        # global.css + one stylesheet per screen
```

## The four screens

1. **Landing** (`/`) — Entry portal. A 4-phase immersion sequence: darkness → space reveals → orbital viewport appears → title and action surface. The title "ERIS" sits *inside* the cupola glass with the universe visible behind it.
2. **Hub** (`/hub`) — Operations center. Rotating holographic planet at center, minimal mission log on the left, discoveries panel on the right (only when present). No chatbot. Pure command-deck feel.
3. **Simulation** (`/simulation/:missionId`) — Fullscreen 3D canvas. Procedurally textured planets with atmospheres, Saturn-style rings, gravitational spacetime grid, luminous trails. A floating bottom console replaces side panels. Five circular dials (mass, distance, run/pause, velocity, time-speed) drive the system. A left sidebar offers observation modes.
4. **Debrief** (`/debrief/:missionId`) — Silent screen. The discovery settles. Open questions, personal log, no grading.

## The three missions (Phase 1)

| Codename  | Title                  | Pedagogical focus                           |
|-----------|------------------------|---------------------------------------------|
| KEPLER-01 | The first well         | Mass deforms space                          |
| KEPLER-02 | Stabilize the orbit    | Balance between velocity and gravity        |
| KEPLER-03 | Binary system          | Shared center of mass and relative motion   |

## Physics

Classical Newtonian gravity, integrated with semi-implicit Euler in 4 sub-steps per frame for orbital stability. The constant `G` and the visual scale are tuned so that visual intuition does not require astronomical precision.

```js
F = G · m₁ · m₂ / r²
a = F / m
v += a · dt
p += v · dt
```

The **visual deformation of the spacetime grid** is a pedagogical analogy, not the Schwarzschild metric. Each vertex sinks proportionally to the combined gravitational potential of all bodies. It looks like a well. It feels like gravity. And that is what matters so a 13-year-old can grasp *what mass does*.

## Procedural planets

Every celestial body is rendered with custom GLSL shaders — no external textures required:

- **Surface**: 6-octave FBM noise (Ashima Arts simplex) mixed across three colors (deep, base, accent) with a directional light terminator. Gas giants get horizontal banding mixed in.
- **Atmosphere**: a back-facing fresnel-rim shader on a slightly larger sphere, additively blended. Breathes gently over a 5-second cycle.
- **Rings**: a `RingGeometry` with a custom shader that paints concentric bands modulated by noise, with smooth fade at the inner and outer edges.
- **Stars**: an emissive noise core plus two additive corona shells plus a real `pointLight` so they actually illuminate nearby bodies.

Bodies are classified by mass: `mass ≥ 50 → star`, `mass ≥ 12 → gas giant`, otherwise `rocky`.

## Visual design

**Palette** — deep space black (`#05070A`), cosmic navy (`#0B1020`), observatory blue (`#111827`). Accents: cyan glow (`#7DE2FC`), soft ice blue (`#B8D8FF`), stellar white (`#F5F7FF`), warm gravity orange (`#FF8A4C`), orbital amber (`#FFB36B`). Orbital states: stable (`#7CFFB2`), warning (`#FFB347`), danger (`#FF5E5E`).

**Typography** — Orbitron for titles and HUD readouts, Inter for body and UI. Wide letter-spacing on display text (0.32–0.42em) for a NASA-instrumental feel.

**Motion** — Contemplative, not energetic. All transitions on `cubic-bezier(0.22, 0.61, 0.36, 1)` and 320–720 ms range. Breathing loops on 4–6 second cycles. Camera drifts in ISS-like respiration. No bouncy easing. No popups.

**Effects** — Glassmorphism with `backdrop-filter: blur(28–32px) saturate(140–160%)`. Cinematic vignette and subtle chromatic aberration. Holographic scanlines, slow drift, halo pulses. Custom SVG controls (circular dials with arcs, ticks, knob orbits) — zero default HTML sliders.

## Interactions

- **Dials**: drag vertically, scroll, or double-click to center.
- **Camera in simulation**: drag to orbit, scroll to zoom (clamped 6–48), gentle ISS-style drift even when idle.
- **Quiz**: appears on demand via "Comprobar observación" — three multiple-choice questions inline with the simulation; feedback is immediate, never blocks the universe behind it.

## Pedagogical philosophy

The user does not read theory blocks. The user **observes, manipulates, breaks, and rebuilds**. Comprehension emerges from the interaction with the system, not from imposed text.

The previous AI assistant was removed because it interrupted the silence the experience requires. Pedagogy now lives in:

1. The mission objective (one sentence at the top).
2. The contextual hint (revealed only on request).
3. The post-experiment quiz (three calm multiple-choice questions).
4. The debrief screen — open questions, no grades.

## Roadmap

- **Phase 1** — Landing · Hub · Simulation with mass/velocity/distance/time dials · Debrief · 3 missions · procedural planets · spatial deformation · comprehension quiz.
- **Phase 2** — More missions, achievement system, basic relativistic effects (gravitational lensing), ambient audio with synthesized drones.
- **Phase 3** — Long-form narrative, free exploration mode with procedural system generation, gravity-assist mechanics, Lagrange points, advanced lensing.

## License

Experimental educational prototype.
