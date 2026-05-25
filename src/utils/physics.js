/* ============================================================
   ERIS · Motor de física
   Gravedad newtoniana simplificada para visualización pedagógica.

   F = G * m1 * m2 / r²
   a = F / m   →   v += a·dt   →   p += v·dt

   No buscamos precisión astronómica.
   Buscamos intuición visual: que el alumno "vea" la gravedad.
   ============================================================ */

import * as THREE from 'three';

// Constante gravitacional reescalada al universo del prototipo.
// El valor real (6.674e-11) es invisible a esta escala.
export const G = 1.0;

// Mínima distancia para evitar singularidades cuando los cuerpos se rozan.
const SOFTENING = 0.6;

/**
 * Calcula la aceleración resultante sobre cada cuerpo
 * a partir de las masas e influencia de todos los demás.
 *
 * bodies: [{ position: THREE.Vector3, velocity: THREE.Vector3, mass: number, fixed?: bool }]
 */
export function computeAccelerations(bodies) {
  const accelerations = bodies.map(() => new THREE.Vector3(0, 0, 0));

  for (let i = 0; i < bodies.length; i++) {
    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;
      const a = bodies[i];
      const b = bodies[j];

      const dir = new THREE.Vector3().subVectors(b.position, a.position);
      const distSq = dir.lengthSq() + SOFTENING * SOFTENING;
      const dist = Math.sqrt(distSq);
      dir.normalize();

      const forceMag = (G * a.mass * b.mass) / distSq;
      const accelMag = forceMag / a.mass; // a = F/m
      accelerations[i].add(dir.multiplyScalar(accelMag));
    }
  }
  return accelerations;
}

/**
 * Integración Velocity Verlet — 2.º orden, simpléctico.
 * Conserva la energía mecánica a largo plazo sin drift acumulado.
 *
 *   1. a₀ = aceleración en posición actual
 *   2. x(t+dt) = x + v·dt + ½·a₀·dt²
 *   3. a₁ = aceleración en la nueva posición
 *   4. v(t+dt) = v + ½·(a₀ + a₁)·dt
 *
 * Sustituye a Euler semi-implícito para garantizar órbitas estables
 * en sistemas de N cuerpos sin que los planetas "escapen" con el tiempo.
 */
export function integrate(bodies, dt) {
  // — Paso 1: aceleraciones actuales —
  const a0 = computeAccelerations(bodies);

  // — Paso 2: actualizar posiciones (corrección de 2.º orden) —
  bodies.forEach((body, i) => {
    if (body.fixed) return;
    body.position.x += body.velocity.x * dt + 0.5 * a0[i].x * dt * dt;
    body.position.y += body.velocity.y * dt + 0.5 * a0[i].y * dt * dt;
    body.position.z += body.velocity.z * dt + 0.5 * a0[i].z * dt * dt;
  });

  // — Paso 3: aceleraciones en la nueva posición —
  const a1 = computeAccelerations(bodies);

  // — Paso 4: actualizar velocidades con aceleración promedio —
  bodies.forEach((body, i) => {
    if (body.fixed) return;
    body.velocity.x += 0.5 * (a0[i].x + a1[i].x) * dt;
    body.velocity.y += 0.5 * (a0[i].y + a1[i].y) * dt;
    body.velocity.z += 0.5 * (a0[i].z + a1[i].z) * dt;
  });
}

/**
 * Pre-calcula una trayectoria futura del cuerpo `index` simulando hacia adelante.
 * Útil para "líneas fantasma" que muestren la órbita antes de pulsar play.
 */
export function predictTrajectory(bodies, index, steps = 400, dt = 0.05) {
  // Clonamos el estado para no modificar el original
  const clones = bodies.map((b) => ({
    position: b.position.clone(),
    velocity: b.velocity.clone(),
    mass: b.mass,
    fixed: b.fixed,
  }));
  const path = [];
  for (let s = 0; s < steps; s++) {
    integrate(clones, dt);
    path.push(clones[index].position.clone());
  }
  return path;
}

/**
 * Curvatura del espacio-tiempo (visualización del "pozo gravitacional").
 * Devuelve un desplazamiento Z en una rejilla 2D plana.
 *
 * Es una analogía pedagógica: no es la métrica real de Schwarzschild,
 * pero comunica con elegancia que las masas "deforman" la geometría.
 */
export function spacetimeDepth(x, z, bodies, scale = 1.4) {
  let depth = 0;
  for (const b of bodies) {
    const dx = x - b.position.x;
    const dz = z - b.position.z;
    const r = Math.sqrt(dx * dx + dz * dz) + SOFTENING;
    depth -= (b.mass * scale) / r;
  }
  return depth;
}

/**
 * Velocidad orbital aproximada para una órbita circular alrededor de un cuerpo central.
 * v = sqrt(G·M / r)
 */
export function circularOrbitVelocity(centralMass, radius) {
  return Math.sqrt((G * centralMass) / radius);
}

/**
 * Energía mecánica total del sistema (útil para debugging / debrief).
 * E = ½ Σ m·v²  −  Σ G·mi·mj / rij
 */
export function totalEnergy(bodies) {
  let kinetic = 0;
  for (const b of bodies) {
    kinetic += 0.5 * b.mass * b.velocity.lengthSq();
  }
  let potential = 0;
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const r = bodies[i].position.distanceTo(bodies[j].position) + SOFTENING;
      potential -= (G * bodies[i].mass * bodies[j].mass) / r;
    }
  }
  return { kinetic, potential, total: kinetic + potential };
}
