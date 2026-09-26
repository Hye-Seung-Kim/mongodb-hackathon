import { useEffect, useRef } from "react";

// Brief wishlist: "Log and map linked. Hover a log line and its node lights
// up (and the reverse)." Both directions share one piece of state
// (hoveredNodeId, lifted to App) -- this panel sets it on row hover and
// reads it back to highlight rows when a node is hovered in the 3D scene.
export function LogPanel({ log, hoveredNodeId, onHoverNode }) {
  const listRef = useRef(null);
  const newestId = log[0]?.id;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [newestId]);

  return (
    <div className="log-panel">
      <div className="log-panel-header">THE LOG</div>
      <div className="log-list" ref={listRef}>
        {log.map((entry) => (
          <div
            key={entry.id}
            className={`log-entry log-entry-${entry.side.toLowerCase()}${entry.nodeId && entry.nodeId === hoveredNodeId ? " log-entry-highlight" : ""}`}
            onMouseEnter={() => entry.nodeId && onHoverNode(entry.nodeId)}
            onMouseLeave={() => onHoverNode(null)}
          >
            <span className={`log-tag log-tag-${entry.side.toLowerCase()}`}>{entry.side}</span>
            <span className="log-turn">T{entry.turn}</span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
        {log.length === 0 && <div className="log-empty">Waiting for the first move...</div>}
      </div>
      <div className="log-panel-footer">newest at top, auto-scrolls</div>
    </div>
  );
}
