/* ============================================================
   ERIS · Holograma central del Hub
   Planeta con atmósfera + anillos + meridianos.
   Estética: holograma de sala de mando.
   ============================================================ */

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function HoloPlanet() {
  const planetRef = useRef();
  const meridiansRef = useRef();
  const atmosRef = useRef();
  const ringsRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (planetRef.current)    planetRef.current.rotation.y    = t * 0.06;
    if (meridiansRef.current) meridiansRef.current.rotation.y = t * 0.06;
    if (atmosRef.current)     atmosRef.current.rotation.y     = -t * 0.025;
    if (ringsRef.current)     ringsRef.current.rotation.z     = t * 0.09;
  });

  // Meridianos: líneas en una esfera
  const meridians = useMemo(() => {
    const lines = [];
    for (let i = 0; i < 12; i++) {
      const points = [];
      for (let p = 0; p <= 64; p++) {
        const a = (p / 64) * Math.PI;
        const theta = (i / 12) * Math.PI * 2;
        const x = Math.sin(a) * Math.cos(theta);
        const y = Math.cos(a);
        const z = Math.sin(a) * Math.sin(theta);
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(points));
    }
    for (let i = 1; i < 6; i++) {
      const points = [];
      const a = (i / 6) * Math.PI;
      for (let p = 0; p <= 64; p++) {
        const theta = (p / 64) * Math.PI * 2;
        const x = Math.sin(a) * Math.cos(theta);
        const y = Math.cos(a);
        const z = Math.sin(a) * Math.sin(theta);
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(points));
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Esfera interior translúcida */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshPhongMaterial
          color="#0B1020"
          emissive="#111827"
          transparent
          opacity={0.55}
          shininess={70}
        />
      </mesh>

      {/* Meridianos holográficos */}
      <group ref={meridiansRef}>
        {meridians.map((geo, i) => (
          <line key={i} geometry={geo} scale={1.402}>
            <lineBasicMaterial color="#7DE2FC" transparent opacity={0.4} />
          </line>
        ))}
      </group>

      {/* Atmósfera */}
      <mesh ref={atmosRef} scale={1.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#B8D8FF"
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Anillos orbitales */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.2, 0.01, 16, 200]} />
          <meshBasicMaterial color="#7DE2FC" transparent opacity={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
          <torusGeometry args={[2.7, 0.008, 16, 200]} />
          <meshBasicMaterial color="#FF8A4C" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 3, -0.3, 0]}>
          <torusGeometry args={[3.2, 0.006, 16, 200]} />
          <meshBasicMaterial color="#B8D8FF" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Pulso central */}
      <pointLight position={[0, 0, 0]} intensity={1.1} color="#7DE2FC" distance={6} />
    </group>
  );
}

export default function HubScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[6, 4, 6]} intensity={0.55} color="#7DE2FC" />
      <pointLight position={[-5, -3, -2]} intensity={0.22} color="#FF8A4C" />
      <Stars radius={90} depth={55} count={2800} factor={2.6} fade speed={0.18} />
      <HoloPlanet />
    </Canvas>
  );
}
