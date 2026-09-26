import { useEffect, useRef } from "react";

// Redesigned per the x.ai-inspired spec: translucent rounded cards instead
// of boxed tags, a colored left-border accent per side, and a muted
// sub-detail line (the real data's `reason` / `guardrail_blocked` /
// `outcome` -- whichever is most informative for that event).
export function LogPanel({ log, hoveredNodeId, onHoverNode }) {
  const listRef = useRef(null);
  const newestId = log[0]?.id;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [newestId]);

  return (
    <div className="panel log-panel">
      <h3>Play-by-play -- newest first</h3>
      <div className="log-list" ref={listRef}>
        {log.map((entry, index) => (
          <div
            key={entry.id}
            className={[
              "log-entry",
              `log-entry-${entry.side.toLowerCase()}`,
              index === 0 ? "log-entry-newest" : "",
              entry.nodeId && entry.nodeId === hoveredNodeId ? "log-entry-highlight" : "",
            ].filter(Boolean).join(" ")}
            onMouseEnter={() => entry.nodeId && onHoverNode(entry.nodeId)}
            onMouseLeave={() => onHoverNode(null)}
          >
            <div className="log-entry-main">
              <span className={`log-turn-tag log-turn-tag-${entry.side.toLowerCase()}`}>T{entry.turn}</span>
              <span className="log-entry-text">{entry.text}</span>
            </div>
            {entry.detail && <div className="log-entry-detail">{entry.detail}</div>}
          </div>
        ))}
        {log.length === 0 && <div className="log-empty">Waiting for the first move...</div>}
      </div>
    </div>
  );
}
