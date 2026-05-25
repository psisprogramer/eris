/* ============================================================
   ERIS · Escena gravitacional
   Cuerpos procedurales con atmósferas y anillos.
   Rejilla de curvatura espaciotemporal. Estelas luminosas.
   ============================================================ */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { spacetimeDepth } from '../utils/physics.js';
import { Planet, Star } from './Planet.jsx';

function classify(body) {
  if (body.fixed || body.mass > 50) return 'star';
  if (body.mass > 12) return 'gas';
  return 'rocky';
}

function Body({ body, index }) {
  const kind = classify(body);
  const bodyRef = useRef(body);
  bodyRef.current = body;

  if (kind === 'star') {
    return (
      <Star
        bodyRef={bodyRef}
        radius={body.radius}
        color={body.color}
        coronaColor="#FFB36B"
      />
    );
  }

  const hasRings = kind === 'gas' && index === 0;
  const rocky = kind === 'rocky';

  return (
    <Planet
      bodyRef={bodyRef}
      radius={body.radius}
      seed={(body.id?.length || index) * 1.27 + index}
      type={kind === 'gas' ? 'gas' : 'rocky'}
      baseColor={body.color}
      accentColor={rocky ? '#F5F7FF' : '#FFB36B'}
      deepColor="#0B1020"
      atmosphereColor={rocky ? '#7DE2FC' : '#B8D8FF'}
      atmosphere
      rings={hasRings}
      ringsColor="#FFB36B"
      ringsInner={body.radius * 1.6}
      ringsOuter={body.radius * 2.6}
      ringsTilt={-0.42}
      rotation={kind === 'gas' ? 0.025 : 0.05}
    />
  );
}

function Trail({ trailRef, color }) {
  const lineRef = useRef();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(240 * 3), 3));
    return g;
  }, []);

  useFrame(() => {
    const trail = trailRef.current;
    if (!trail || trail.length === 0 || !lineRef.current) return;
    const arr = geom.attributes.position.array;
    const N = trail.length;
    for (let i = 0; i < N; i++) {
      arr[i * 3]     = trail[i].x;
      arr[i * 3 + 1] = trail[i].y;
      arr[i * 3 + 2] = trail[i].z;
    }
    geom.setDrawRange(0, N);
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <line ref={lineRef} geometry={geom}>
      <lineBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
    </line>
  );
}

function SpacetimeGrid({ bodiesRef, size = 36, segments = 80 }) {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, segments, segments);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [size, segments]);

  useFrame(() => {
    if (!meshRef.current || !bodiesRef.current) return;
    const pos = geometry.attributes.position;
    const bodies = bodiesRef.current;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = spacetimeDepth(x, z, bodies, 1.8);
      pos.setY(i, Math.max(d, -8));
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, -0.05, 0]}>
      <meshBasicMaterial color="#7DE2FC" wireframe transparent opacity={0.18} />
    </mesh>
  );
}

function PhysicsTicker({ tick, running, speed }) {
  useFrame((_, delta) => {
    if (!running) return;
    const sub = 4;
    const dt = (Math.min(delta, 0.05) * speed) / sub;
    for (let i = 0; i < sub; i++) tick(dt);
  });
  return null;
}

function ObservatoryCamera() {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.03;
    const dx = Math.sin(t) * 0.18;
    const dy = Math.cos(t * 0.7) * 0.12;
    camera.position.x += (dx - (camera.userData._dx || 0));
    camera.position.y += (dy - (camera.userData._dy || 0));
    camera.userData._dx = dx;
    camera.userData._dy = dy;
  });
  return null;
}

function GravityDust() {
  const positions = useMemo(() => {
    const N = 180;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30 + 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#B8D8FF" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function GravityScene({
  bodiesRef, trailsRef, tick, running, speed = 1, showGrid = true,
}) {
  return (
    <Canvas
      camera={{ position: [0, 9, 16], fov: 48 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#05070A']} />
      <fog attach="fog" args={['#05070A', 22, 90]} />
      <ambientLight intensity={0.18} />
      <pointLight position={[10, 12, 8]}  intensity={0.55} color="#7DE2FC" />
      <pointLight position={[-8, -4, -6]} intensity={0.26} color="#FF8A4C" />
      <Stars radius={180} depth={120} count={6500} factor={2.4} fade speed={0.08} />
      <Stars radius={70}  depth={40}  count={900}  factor={3.6} fade speed={0.18} />
      <GravityDust />
      {showGrid && <SpacetimeGrid bodiesRef={bodiesRef} />}
      {bodiesRef.current.map((b, i) => (
        <Body key={b.id} body={b} index={i} />
      ))}
      {bodiesRef.current.map((b, i) => (
        <Trail
          key={`trail-${b.id}`}
          trailRef={{ current: trailsRef.current[i] }}
          color={b.color}
        />
      ))}
      <PhysicsTicker tick={tick} running={running} speed={speed} />
      <ObservatoryCamera />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.045}
        rotateSpeed={0.45}
        zoomSpeed={0.6}
        minDistance={6}
        maxDistance={48}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}
