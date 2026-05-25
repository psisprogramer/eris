/* ============================================================
   ERIS · Fondo espacial profundo
   3 capas de estrellas con paralax, nebulosas, polvo, sol distante.
   ============================================================ */

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ---- Nebula procedural ---- */
function Nebula({ color = '#7DE2FC', position = [0, 0, -25], scale = 16, opacity = 0.12, seed = 0 }) {
  const ref = useRef();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime:  { value: 0 },
      uSeed:  { value: seed },
      uAlpha: { value: opacity },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uSeed;
      uniform float uAlpha;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.05; a *= 0.5; }
        return v;
      }
      void main(){
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        if (r > 1.0) discard;
        float n = fbm(p * 3.0 + vec2(uSeed * 7.3, uTime * 0.01));
        float falloff = pow(1.0 - r, 2.5);
        float a = uAlpha * falloff * (0.4 + n * 0.9);
        gl_FragColor = vec4(uColor * (0.6 + n * 0.6), a);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [color, opacity, seed]);

  useFrame((state) => {
    if (!ref.current) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    ref.current.rotation.z += 0.0002;
  });

  return (
    <mesh ref={ref} position={position} scale={scale} material={material}>
      <planeGeometry args={[2, 2, 1, 1]} />
    </mesh>
  );
}

/* ---- Sol distante ---- */
function DistantSun({ position = [40, 18, -50] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.6, 24, 24]} />
        <meshBasicMaterial color="#FFB36B" />
      </mesh>
      <mesh scale={2.8}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#FF8A4C" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={6}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#FFB36B" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---- Polvo cósmico ---- */
function CosmicDust({ count = 260 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 2] = -Math.random() * 60 - 4;
    }
    return arr;
  }, [count]);
  const ref = useRef();
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#B8D8FF" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ---- Cámara deriva ---- */
function CameraDrift({ amplitude = 0.55, baseZ = 8 }) {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.05;
    camera.position.x = Math.sin(t) * amplitude;
    camera.position.y = Math.cos(t * 0.7) * amplitude * 0.7;
    camera.position.z = baseZ + Math.sin(t * 0.4) * 0.3;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function SpaceBackground({ intensity = 1, drift = true, sun = true }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#05070A']} />
      <fog attach="fog" args={['#05070A', 16, 80]} />
      <ambientLight intensity={0.22 * intensity} />
      <pointLight position={[10, 5, 5]}   intensity={0.55 * intensity} color="#7DE2FC" />
      <pointLight position={[-10, -4, -2]} intensity={0.28 * intensity} color="#FF8A4C" />
      <Stars radius={180} depth={120} count={6500} factor={2.5} fade speed={0.08} />
      <Stars radius={80}  depth={50}  count={1200} factor={3.8} fade speed={0.18} />
      <CosmicDust count={260} />
      <Nebula color="#7DE2FC" position={[-12, 6, -30]}  scale={14} opacity={0.13} seed={0.1} />
      <Nebula color="#B8D8FF" position={[8,  -4, -40]}  scale={20} opacity={0.09} seed={2.7} />
      <Nebula color="#FF8A4C" position={[18, -8, -45]}  scale={12} opacity={0.06} seed={5.1} />
      {sun && <DistantSun position={[36, 14, -50]} />}
      {drift && <CameraDrift />}
    </Canvas>
  );
}
