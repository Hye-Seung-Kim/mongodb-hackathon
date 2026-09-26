import { Line } from "@react-three/drei";

export function Edge({ from, to, blocked }) {
  return (
    <Line
      points={[from, to]}
      color={blocked ? "#ef4444" : "#3f3f46"}
      lineWidth={blocked ? 1.5 : 2}
      dashed={blocked}
      dashSize={0.15}
      gapSize={0.1}
      transparent
      opacity={blocked ? 0.7 : 0.5}
    />
  );
}
