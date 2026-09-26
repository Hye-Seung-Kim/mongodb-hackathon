import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

// Brief wishlist: "Show movement. A red pulse traveling down a line when Red
// hops." A glowing sphere lerping from one node's position to another over
// its own lifetime, independent of the engine's turn timing.
const DURATION_S = 0.9;

export function AttackPulse({ from, to }) {
  const ref = useRef(null);
  const startRef = useRef(null);
  const a = useMemo(() => new Vector3(...from), [from]);
  const b = useMemo(() => new Vector3(...to), [to]);

  useFrame((state) => {
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const t = Math.min(1, (state.clock.elapsedTime - startRef.current) / DURATION_S);
    if (ref.current) {
      ref.current.position.lerpVectors(a, b, t);
      ref.current.scale.setScalar(1 - t * 0.4);
    }
  });

  return (
    <mesh ref={ref} position={from}>
      <sphereGeometry args={[0.12, 12, 12]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.2} />
    </mesh>
  );
}
