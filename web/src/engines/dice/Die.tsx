import "./Die.css";

interface Props {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  kept?: boolean;
  rolling?: boolean;
  onClick?: () => void;
}

const PIP_POSITIONS: Record<number, ReadonlyArray<[number, number]>> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export function Die({ value, kept, rolling, onClick }: Props): JSX.Element {
  const pips = PIP_POSITIONS[value] ?? [];
  return (
    <button
      type="button"
      className={`die ${kept ? "kept" : ""} ${rolling ? "rolling" : ""}`}
      onClick={onClick}
      aria-label={`die showing ${value}${kept ? " (kept)" : ""}`}
      aria-pressed={!!kept}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="die-face-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dbe2ec" />
          </linearGradient>
          <radialGradient id="die-face-highlight" cx="30%" cy="22%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* main face */}
        <rect x="4" y="4" width="92" height="92" rx="18" fill="url(#die-face-gradient)" />
        {/* glossy highlight */}
        <rect x="4" y="4" width="92" height="92" rx="18" fill="url(#die-face-highlight)" />
        {/* pips */}
        {pips.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="8" />
        ))}
      </svg>
    </button>
  );
}
