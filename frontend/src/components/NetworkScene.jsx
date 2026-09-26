import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { NODES, EDGES, NODE_POSITIONS } from "../data/network";
import { NodeOrb } from "../three/NodeOrb";
import { Edge } from "../three/Edge";
import { AttackPulse } from "../three/AttackPulse";
import { ShieldFlash } from "../three/ShieldFlash";
import { Legend } from "./Legend";

function edgeKey(a, b) {
  return [a, b].sort().join("|");
}

export function NetworkScene({ state, hoveredNodeId, onHoverNode }) {
  return (
    <div className="network-scene">
      <Canvas camera={{ position: [0, 3, 9], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={["#05070d"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#3b82f6" />

        {EDGES.map(([a, b]) => (
          <Edge key={edgeKey(a, b)} from={NODE_POSITIONS[a]} to={NODE_POSITIONS[b]} blocked={state.blockedEdges.has(edgeKey(a, b))} />
        ))}

        {NODES.map((node) => (
          <NodeOrb
            key={node.id}
            node={node}
            position={NODE_POSITIONS[node.id]}
            status={state.nodeStatus[node.id]}
            hidden={Boolean(state.hiddenRed[node.id])}
            isHovered={hoveredNodeId === node.id}
            onHover={onHoverNode}
          />
        ))}

        {state.effects.map((effect) =>
          effect.kind === "pulse" ? (
            <AttackPulse key={effect.id} from={NODE_POSITIONS[effect.from]} to={NODE_POSITIONS[effect.to]} />
          ) : (
            <ShieldFlash key={effect.id} position={NODE_POSITIONS[effect.nodeId]} />
          ),
        )}

        <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} minDistance={5} maxDistance={16} />
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <Legend />
    </div>
  );
}
