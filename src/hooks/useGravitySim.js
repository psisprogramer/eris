/* ============================================================
   ERIS · Hook de simulación gravitacional
   Convierte la definición de una misión en cuerpos vivos
   integrados frame a frame.
   ============================================================ */

import { useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { integrate } from '../utils/physics.js';

export function useGravitySim(initialBodies) {
  // Estado físico mutable que React no necesita re-renderizar.
  const bodiesRef = useRef(
    initialBodies.map((b) => ({
      id: b.id,
      mass: b.mass,
      position: new THREE.Vector3(...b.position),
      velocity: new THREE.Vector3(...b.velocity),
      color: b.color,
      radius: b.radius,
      fixed: !!b.fixed,
      label: b.label,
    }))
  );

  // Lista de trazas — historial de posiciones para renderizar la órbita.
  const trailsRef = useRef(initialBodies.map(() => []));
  const TRAIL_MAX = 220;

  const tick = useCallback((dt) => {
    const bodies = bodiesRef.current;
    integrate(bodies, dt);
    bodies.forEach((b, i) => {
      const trail = trailsRef.current[i];
      trail.push(b.position.clone());
      if (trail.length > TRAIL_MAX) trail.shift();
    });
  }, []);

  const reset = useCallback(() => {
    bodiesRef.current.forEach((b, i) => {
      const original = initialBodies[i];
      b.mass = original.mass;
      b.position.set(...original.position);
      b.velocity.set(...original.velocity);
      b.fixed = !!original.fixed;
    });
    trailsRef.current = initialBodies.map(() => []);
  }, [initialBodies]);

  const setMass = useCallback((id, mass) => {
    const b = bodiesRef.current.find((x) => x.id === id);
    if (b) b.mass = mass;
  }, []);

  const setVelocityMagnitude = useCallback((id, magnitude) => {
    const b = bodiesRef.current.find((x) => x.id === id);
    if (!b) return;
    const current = b.velocity.length();
    if (current < 1e-6) {
      b.velocity.set(0, 0, magnitude);
    } else {
      b.velocity.setLength(magnitude);
    }
  }, []);

  // Devolver referencias estables. Componentes 3D leen de bodiesRef directamente cada frame.
  return useMemo(
    () => ({
      bodiesRef,
      trailsRef,
      tick,
      reset,
      setMass,
      setVelocityMagnitude,
    }),
    [tick, reset, setMass, setVelocityMagnitude]
  );
}
