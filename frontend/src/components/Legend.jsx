import { STATUS_COLORS, STATUS_LABELS } from "../lib/colors";

export function Legend() {
  return (
    <div className="legend">
      {Object.entries(STATUS_LABELS).map(([status, label]) => (
        <div key={status} className="legend-item">
          <span className="legend-dot" style={{ background: STATUS_COLORS[status] }} />
          {label}
        </div>
      ))}
    </div>
  );
}
