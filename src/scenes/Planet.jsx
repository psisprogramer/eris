/* ============================================================
   ERIS · Planet
   Cuerpo celeste procedural con shaders GLSL.
   - Superficie: FBM noise multi-octava
   - Atmósfera: capa fresnel rim
   - Anillos: gradient + bandas
   - Estrella: emisión radial + corona
   ============================================================ */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================
// GLSL · simplex noise + FBM (compartido)
// ============================================================
const NOISE_GLSL = /* glsl */`
// Classic simplex noise — Ashima Arts, MIT
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p, int octaves){
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.0);
  for (int i = 0; i < 8; i++){
    if (i >= octaves) break;
    v += a * snoise(p);
    p = p * 2.02 + shift;
    a *= 0.5;
  }
  return v;
}
`;

// ============================================================
// Material de superficie
// ============================================================
function makeSurfaceMaterial({ baseColor, accentColor, deepColor, type = 'rocky', seed = 0 }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime:    { value: 0 },
      uSeed:    { value: seed },
      uBase:    { value: new THREE.Color(baseColor) },
      uAccent:  { value: new THREE.Color(accentColor) },
      uDeep:    { value: new THREE.Color(deepColor) },
      uType:    { value: type === 'gas' ? 1.0 : 0.0 },
      uLightDir:{ value: new THREE.Vector3(0.7, 0.4, 0.6).normalize() },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vPos;
      void main() {
        vNormal   = normalize(normalMatrix * normal);
        vec4 wp   = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vPos      = position;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: NOISE_GLSL + /* glsl */`
      uniform float uTime;
      uniform float uSeed;
      uniform vec3 uBase;
      uniform vec3 uAccent;
      uniform vec3 uDeep;
      uniform float uType;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec3 vPos;

      void main() {
        vec3 p = normalize(vPos) + vec3(uSeed * 13.7);

        // Si es gaseoso: usamos bandas horizontales
        float bands  = sin(p.y * 6.0 + fbm(p * 1.8, 4) * 2.5);
        float fbmVal = fbm(p * 2.0, 6);
        float surface = mix(fbmVal, mix(fbmVal * 0.4, bands * 0.6 + fbmVal * 0.4, 0.7), uType);

        // Mapeo a 3 colores
        float t1 = smoothstep(-0.4, 0.2, surface);
        float t2 = smoothstep( 0.0, 0.6, surface + fbm(p * 4.0, 3) * 0.3);
        vec3 col = mix(uDeep, uBase, t1);
        col = mix(col, uAccent, t2 * 0.75);

        // Iluminación direccional sutil
        float ndl = clamp(dot(vNormal, normalize(uLightDir)), 0.0, 1.0);
        float ambient = 0.32;
        float litFactor = ambient + (1.0 - ambient) * ndl;

        // Sombra terminator suave
        float terminator = smoothstep(-0.02, 0.18, ndl);
        col *= mix(0.55, 1.05, terminator);
        col *= litFactor;

        // Realce sutil ecuatorial para gaseosos
        col += uType * (0.04 * sin(p.y * 12.0 + uTime * 0.05));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

// ============================================================
// Material de atmósfera (fresnel rim)
// ============================================================
function makeAtmosphereMaterial({ color }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime:  { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vView), 0.0);
        rim = pow(rim, 2.8);
        // Pulso atmosférico muy lento
        float breathing = 0.92 + 0.08 * sin(uTime * 0.4);
        gl_FragColor = vec4(uColor, rim * 0.85 * breathing);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

// ============================================================
// Material de halo (estrellas)
// ============================================================
function makeCoronaMaterial({ color }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime:  { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vView), 0.0);
        rim = pow(rim, 1.8);
        float pulse = 0.85 + 0.15 * sin(uTime * 0.6);
        gl_FragColor = vec4(uColor, rim * pulse);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

// ============================================================
// Material de anillos
// ============================================================
function makeRingsMaterial({ color, innerRadius, outerRadius }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uInner: { value: innerRadius },
      uOuter: { value: outerRadius },
      uTime:  { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: NOISE_GLSL + /* glsl */`
      uniform vec3 uColor;
      uniform float uInner;
      uniform float uOuter;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        float r = length(vPos.xy);
        float t = (r - uInner) / (uOuter - uInner);
        if (t < 0.0 || t > 1.0) discard;

        // Bandas
        float bands = sin(t * 60.0) * 0.5 + 0.5;
        bands = smoothstep(0.4, 0.8, bands);
        float dust = abs(snoise(vec3(t * 18.0, 0.0, 0.0))) * 0.6;
        float density = mix(0.25, 0.95, bands) * (0.55 + dust);

        // Desvanecer en bordes
        float fadeIn  = smoothstep(0.0, 0.08, t);
        float fadeOut = smoothstep(1.0, 0.92, t);

        gl_FragColor = vec4(uColor, density * fadeIn * fadeOut * 0.78);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

// ============================================================
// Componentes React
// ============================================================
export function Planet({
  position = [0, 0, 0],
  radius = 1.4,
  baseColor = '#8ba0c4',
  accentColor = '#d6e3ff',
  deepColor = '#1a2240',
  atmosphereColor = '#7DE2FC',
  atmosphere = true,
  rings = false,
  ringsColor = '#FFB36B',
  ringsInner = 1.8,
  ringsOuter = 2.6,
  ringsTilt = -0.42,
  type = 'rocky', // rocky | gas
  rotation = 0.04,
  seed = 0,
  bodyRef,
}) {
  const groupRef = useRef();
  const planetRef = useRef();

  const surfaceMaterial = useMemo(
    () => makeSurfaceMaterial({ baseColor, accentColor, deepColor, type, seed }),
    [baseColor, accentColor, deepColor, type, seed]
  );
  const atmosMaterial = useMemo(
    () => makeAtmosphereMaterial({ color: atmosphereColor }),
    [atmosphereColor]
  );
  const ringsMaterial = useMemo(
    () => rings ? makeRingsMaterial({ color: ringsColor, innerRadius: ringsInner, outerRadius: ringsOuter }) : null,
    [rings, ringsColor, ringsInner, ringsOuter]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    surfaceMaterial.uniforms.uTime.value = t;
    atmosMaterial.uniforms.uTime.value = t;
    if (ringsMaterial) ringsMaterial.uniforms.uTime.value = t;

    if (planetRef.current) planetRef.current.rotation.y = t * rotation;

    // Si hay bodyRef (física), seguir posición
    if (bodyRef?.current && groupRef.current) {
      const body = bodyRef.current;
      groupRef.current.position.copy(body.position);
      const s = Math.cbrt(body.mass / 60) * radius * 1.0 + radius * 0.3;
      groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={planetRef} material={surfaceMaterial}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
      {atmosphere && (
        <mesh material={atmosMaterial} scale={radius * 1.12}>
          <sphereGeometry args={[1, 48, 48]} />
        </mesh>
      )}
      {rings && (
        <mesh material={ringsMaterial} rotation={[Math.PI / 2 + ringsTilt, 0, 0]}>
          <ringGeometry args={[ringsInner, ringsOuter, 128, 1]} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================
// Estrella — emisión radial + corona
// ============================================================
export function Star({
  position = [0, 0, 0],
  radius = 1.4,
  color = '#FFB36B',
  coronaColor = '#FF8A4C',
  bodyRef,
}) {
  const groupRef = useRef();
  const coreMaterial = useMemo(
    () => new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
      },
      vertexShader: /* glsl */`
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: NOISE_GLSL + /* glsl */`
        uniform float uTime;
        uniform vec3 uColor;
        varying vec3 vPos;
        void main() {
          vec3 p = normalize(vPos);
          float n = fbm(p * 4.0 + vec3(uTime * 0.04), 5);
          vec3 hot = uColor * (1.4 + n * 0.7);
          gl_FragColor = vec4(hot, 1.0);
        }
      `,
    }),
    [color]
  );

  const coronaMaterial = useMemo(() => makeCoronaMaterial({ color: coronaColor }), [coronaColor]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    coreMaterial.uniforms.uTime.value = t;
    coronaMaterial.uniforms.uTime.value = t;
    if (bodyRef?.current && groupRef.current) {
      const body = bodyRef.current;
      groupRef.current.position.copy(body.position);
      const s = Math.cbrt(body.mass / 60) * radius * 1.0 + radius * 0.4;
      groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh material={coreMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
      <mesh material={coronaMaterial} scale={1.45}>
        <sphereGeometry args={[radius, 32, 32]} />
      </mesh>
      <mesh material={coronaMaterial} scale={2.0}>
        <sphereGeometry args={[radius, 24, 24]} />
      </mesh>
      <pointLight color={color} intensity={1.4} distance={20} decay={2} />
    </group>
  );
}
