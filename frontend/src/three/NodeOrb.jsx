import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Text } from "@react-three/drei";
import { STATUS_COLORS } from "../lib/colors";

// The brief's flat colored dots, but as a soft glowing organic blob (distort
// + emissive + bloom in NetworkScene) instead -- "more fun" per the request
// to replace the circles with something 3D, in the vein of x.ai/voice's
// glowing-orb aesthetic.
export function NodeOrb({ node, position, status, hidden, isHovered, onHover }) {
  const meshRef = useRef(null);
  const baseColor = STATUS_COLORS[status];
  const size = node.crownJewel ? 0.62 : 0.42;
  // "Hidden vs. seen" wishlist: a Red-held node Blue hasn't scanned yet
  // renders faint rather than fully lit, until a scan reveals it.
  const opacity = hidden ? 0.35 : 1;

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const pulseSpeed = status === "attacked" ? 4 : 1.2;
    const pulseAmount = status === "attacked" ? 0.08 : 0.03;
    const s = 1 + Math.sin(t * pulseSpeed + position[0]) * pulseAmount + (isHovered ? 0.12 : 0);
    meshRef.current.scale.setScalar(s);
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <icosahedronGeometry args={[size, 4]} />
        <MeshDistortMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hidden ? 0.3 : 0.9}
          distort={0.35}
          speed={1.6}
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>

      {node.crownJewel && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size * 1.35, 0.02, 8, 48]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
      )}

      <Text position={[0, -(size + 0.35), 0]} fontSize={0.22} color="#e5e7eb" anchorX="center" anchorY="middle">
        {node.name}
      </Text>
    </group>
  );
}
