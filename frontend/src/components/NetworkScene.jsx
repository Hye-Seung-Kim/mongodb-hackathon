import { Suspense, lazy } from "react";
import { EDGES, NODES } from "../data/network";
import { COLORS, STATUS_COLORS } from "../lib/colors";
import { Legend } from "./Legend";

// three.js + @react-three/fiber are a meaningful chunk of bundle size --
// lazy-loaded so only this panel (i.e. actual gameplay) pays for them.
const VoiceSphereScene = lazy(() => import("../three/VoiceSphereScene").then((m) => ({ default: m.VoiceSphereScene })));

const BLUE_ACTION_BADGE = {
  isolate: "\u{1F512} ISOLATE",
  reset_creds: "\u{1F511} RESET",
  scan: "\u{1F50D} SCAN",
  review_logins: "\u{1F50D} REVIEW",
  restore: "♻️ RESTORE",
};

function nodeById(id) {
  return NODES.find((n) => n.id === id);
}

function labelY(node) {
  return node.pos[1] + node.r + 24;
}

export function NetworkScene({ state, hoveredNodeId, onHoverNode }) {
  const targetNode = state.nextRedPreview?.target ? nodeById(state.nextRedPreview.target) : null;

  return (
    <div className="panel network-scene">
      <h3>The network -- live traffic</h3>

      <Suspense fallback={null}>
        <VoiceSphereScene />
      </Suspense>

      {state.nextRedPreview && (
        <div className="intent">
          {"⚠ "}Red's next move{targetNode ? ` → ${targetNode.name}` : ""}: {state.nextRedPreview.text}
        </div>
      )}

      <svg viewBox="0 0 1000 560" width="100%" height="100%" className="network-svg">
        <defs>
          <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map(([aId, bId]) => {
          const a = nodeById(aId);
          const b = nodeById(bId);
          const downstreamStatus = state.nodeStatus[bId] ?? "safe";
          const isHot = downstreamStatus !== "safe" && (bId === state.lastAttackTarget || aId === state.lastAttackTarget);
          const color = isHot ? STATUS_COLORS[downstreamStatus] : COLORS.line;
          return (
            <g key={`${aId}-${bId}`}>
              <line x1={a.pos[0]} y1={a.pos[1]} x2={b.pos[0]} y2={b.pos[1]} stroke={color} strokeWidth={isHot ? 6 : 3} opacity={isHot ? 0.7 : 0.5} strokeLinecap="round" />
              {isHot && (
                <circle r="5" fill={STATUS_COLORS[downstreamStatus]}>
                  <animateMotion dur="0.9s" repeatCount="indefinite" path={`M${a.pos[0]},${a.pos[1]} L${b.pos[0]},${b.pos[1]}`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Nodes -- glassmorphic: soft outer glow, translucent fill, bright ring */}
        {NODES.map((node) => {
          const status = state.nodeStatus[node.id] ?? "safe";
          const color = STATUS_COLORS[status];
          const isHovered = hoveredNodeId === node.id;
          const isBlueTarget = state.lastBlueTarget === node.id;
          const badge = isBlueTarget && state.log[0]?.side === "BLUE" ? BLUE_ACTION_BADGE[state.log[0]?.action] : null;
          const showGlow = node.id === state.lastAttackTarget && status !== "safe";
          const r = isHovered ? node.r + 4 : node.r;

          return (
            <g key={node.id} onMouseEnter={() => onHoverNode(node.id)} onMouseLeave={() => onHoverNode(null)} style={{ cursor: "pointer" }}>
              {showGlow && <circle cx={node.pos[0]} cy={node.pos[1]} r={r + 16} fill={color} opacity="0.25" filter="url(#glow)" />}
              <circle cx={node.pos[0]} cy={node.pos[1]} r={r + 6} fill={color} opacity="0.12" filter="url(#glow)" />
              <circle cx={node.pos[0]} cy={node.pos[1]} r={r} fill={`${color}2A`} stroke={color} strokeWidth={node.crownJewel ? 3.5 : 2.5} />
              <circle cx={node.pos[0] - r * 0.3} cy={node.pos[1] - r * 0.35} r={r * 0.35} fill="#fff" opacity="0.08" />
              {node.icon && <text x={node.pos[0]} y={node.pos[1] + 7} fontSize="20" textAnchor="middle">{node.icon}</text>}
              <text x={node.pos[0]} y={labelY(node)} fill={node.crownJewel ? COLORS.gold : COLORS.text} fontSize="14" fontWeight="700" textAnchor="middle">
                {node.name}
              </text>
              {badge && (
                <g transform={`translate(${node.pos[0] - 40}, ${node.pos[1] - r - 26})`}>
                  <rect width="80" height="20" rx="5" fill={COLORS.blue} />
                  <text x="40" y="14" fill="#fff" fontSize="11" textAnchor="middle" fontWeight="700">{badge}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <Legend />
    </div>
  );
}
