import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide } from "three";

// Brief wishlist: "A shield flash when Blue blocks." An expanding, fading
// ring centered on the node a Blue defense just touched.
const DURATION_S = 0.8;

export function ShieldFlash({ position }) {
  const ref = useRef(null);
  const materialRef = useRef(null);
  const startRef = useRef(null);

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - startRef.current) / DURATION_S);
    if (ref.current) ref.current.scale.setScalar(0.5 + t * 1.5);
    if (materialRef.current) materialRef.current.opacity = 1 - t;
  });

  return (
    <mesh ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.58, 32]} />
      <meshBasicMaterial ref={materialRef} color="#60a5fa" transparent opacity={1} side={DoubleSide} />
    </mesh>
  );
}
