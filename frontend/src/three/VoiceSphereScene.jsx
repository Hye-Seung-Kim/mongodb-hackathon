import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// x.ai/voice-inspired background: a glowing, organically-displaced sphere
// with a Fresnel rim that blends red/blue (the "RED vs BLUE" theme), plus a
// dim wireframe shell for the "network grid" look, sitting behind the 2D SVG
// node overlay (that overlay stays 2D and data-driven -- this layer is
// purely atmospheric).
//
// Uses a hand-written trig-based pseudo-noise rather than a textbook
// simplex-noise GLSL snippet: this environment has no browser to visually
// verify shader output in, so a shader that's simple enough to read and be
// confident is correct beats a more "authentic" one that might silently
// render black if mistyped from memory.
const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  float pseudoNoise(vec3 p, float t) {
    return sin(p.x * 2.0 + t) * cos(p.y * 2.3 - t * 0.7) * sin(p.z * 1.7 + t * 1.3);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    float n = pseudoNoise(position * 1.5, uTime * 0.6);
    vec3 displaced = position + normal * n * 0.09;
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 2.2);

    vec3 red = vec3(1.0, 0.30, 0.30);
    vec3 blue = vec3(0.23, 0.51, 0.965);
    float mixFactor = 0.5 + 0.5 * sin(uTime * 0.3 + vNormal.x * 2.0);
    vec3 rim = mix(blue, red, mixFactor);

    vec3 base = vec3(0.02, 0.03, 0.07);
    vec3 color = base + rim * fresnel * 1.6;

    gl_FragColor = vec4(color, fresnel * 0.85 + 0.12);
  }
`;

function GlowSphere() {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  // A ref (not useMemo) so mutating it in useFrame is the standard "mutable
  // box" pattern -- this is the idiomatic r3f way to animate a shader
  // uniform every frame without triggering a React re-render.
  const uniformsRef = useRef({ uTime: { value: 0 } });

  useFrame((state) => {
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[1.6, 6]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniformsRef.current}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.75, 2]} />
        <meshBasicMaterial color="#3B82F6" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function VoiceSphereScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <GlowSphere />
    </Canvas>
  );
}
