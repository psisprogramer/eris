# ERIS

> Explora la geometría del universo.

Prototipo web interactivo e inmersivo que enseña gravedad, órbitas y curvatura del espacio mediante simulación, no memorización. Pensado para adolescentes de 12 a 15 años, pero diseñado como si fuera ciencia ficción cinematográfica — porque la fascinación es la primera maestra.

## Filosofía

ERIS no es una clase. No es un dashboard. No es una plataforma educativa.

Es una **estación de observación**. El usuario es tripulación. Las misiones no son niveles: son tareas de una expedición científica. Cuando alguien entra al prototipo debe sentir *"estoy explorando el universo"*, y al salir, *"ahora entiendo intuitivamente cómo funciona la gravedad"*.

## Stack

- **React 18** + **Vite** como base.
- **Three.js** + **@react-three/fiber** + **@react-three/drei** para todo lo 3D.
- **react-router-dom** para la navegación entre escenas.
- CSS modular por pantalla, glassmorphism y efectos holográficos sin librerías de UI.

## Cómo correr el prototipo

```bash
cd eris
npm install
npm run dev
```

El navegador se abre automáticamente en `http://localhost:5173`.

## Arquitectura

```
src/
├── pages/         # Landing · Hub · Simulation · Debrief (las 4 pantallas)
├── scenes/        # SpaceBackground · HubScene · GravityScene (las 3 escenas 3D)
├── components/    # HoloPanel · HoloButton · HoloSlider · AIAssistant · MissionCard
├── hooks/         # useMissionProgress (Context) · useGravitySim (motor)
├── utils/         # physics.js — F = G·m₁·m₂/r²
├── data/          # missions.js — definición declarativa de cada escenario
└── styles/        # global.css + uno por pantalla
```

## Las cuatro pantallas

1. **Landing** (`/`) — Compuerta de entrada. Estrellas, nebulosas, deriva lenta de cámara, tipografía cinematográfica. Una sola intención: provocar asombro.
2. **Hub** (`/hub`) — Centro de operaciones. Holograma planetario rotando al centro, panel de misiones a la izquierda, asistente IA y bitácora a la derecha.
3. **Simulación** (`/simulation/:missionId`) — Canvas 3D fullscreen. Cuerpos masivos, rejilla deformable que muestra la curvatura del espacio-tiempo, estelas orbitales, y dos sliders fundamentales: **masa** y **velocidad**.
4. **Debrief** (`/debrief/:missionId`) — Pantalla silenciosa. El descubrimiento se asienta. Preguntas abiertas, bitácora personal, no hay calificaciones.

## Las tres misiones (Fase 1)

| Codename | Título | Foco pedagógico |
|----------|--------|-----------------|
| KEPLER-01 | El primer pozo | La masa deforma el espacio |
| KEPLER-02 | Estabiliza la órbita | El equilibrio entre velocidad y gravedad |
| KEPLER-03 | Sistema binario | Centro de masa común y movimiento relativo |

## Física

Gravedad newtoniana clásica, integrada con Euler semi-implícito en 4 subpasos por frame para estabilidad orbital. La constante `G` y la escala están reajustadas para que la intuición visual no requiera precisión astronómica.

```js
F = G · m₁ · m₂ / r²
a = F / m
v += a · dt
p += v · dt
```

La **deformación visual de la rejilla** del espacio-tiempo es una analogía pedagógica, no la métrica de Schwarzschild. Cada vértice baja proporcionalmente al potencial gravitacional combinado de todos los cuerpos. Se ve como un pozo. Se siente como gravedad. Y eso es lo que importa para que un estudiante de 13 años entienda *qué hace la masa*.

## Diseño visual

Paleta: azul espacial profundo, negro, violeta oscuro. Acentos cyan brillante, magenta y blanco frío. Tipografía: Orbitron para títulos, Space Grotesk para UI, Inter para cuerpo. Glassmorphism, blur, glow, esquinas marcadas estilo HUD, scanlines holográficas.

Sin botones tradicionales. Sin cajas rígidas. Sin paneles corporativos.

## Roadmap

- **Fase 1** ✅ Landing · Hub · Simulación con controles de masa/velocidad · Debrief · 3 misiones · IA asistente · deformación espacial.
- **Fase 2** — Más misiones, sistema de logros, IA contextual que reacciona a lo que el usuario está haciendo, simulaciones con efectos relativistas básicos (lensing).
- **Fase 3** — Narrativa larga, modo de exploración libre con generación procedural de sistemas, laboratorio espacial, simulaciones avanzadas (Lagrange, asistencia gravitacional).

## Licencia

Prototipo educativo experimental.
