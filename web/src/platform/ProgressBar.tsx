import { useMemo } from "react";

export interface ProgressBarProps {
  /** Current progress value (clamped to 0..max). */
  value: number;
  /** Maximum value (must be > 0; otherwise the bar renders empty). */
  max: number;
  /** Optional human-readable label rendered above the bar. */
  label?: string;
  /** Test id forwarded to the wrapper element. */
  testId?: string;
  /** Optional accessible label override; falls back to `label` if omitted. */
  ariaLabel?: string;
}

/**
 * Generic progress bar for multi-round games (quizzes, Yahtzee, Pig, Farkle,
 * solitaire deck progress, roll-and-write, etc.).
 *
 * The fill width is animated via CSS transition on the inline width style so
 * incremental progress feels alive without a JS animation loop. Honors
 * `prefers-reduced-motion` by collapsing the transition duration to zero in
 * the matching media query — see the inline <style> below.
 */
export function ProgressBar({
  value,
  max,
  label,
  testId,
  ariaLabel,
}: ProgressBarProps): JSX.Element {
  const { clamped, pct } = useMemo(() => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
    const safeVal = Number.isFinite(value) ? value : 0;
    const c = safeMax === 0 ? 0 : Math.max(0, Math.min(safeMax, safeVal));
    const p = safeMax === 0 ? 0 : Math.round((c / safeMax) * 100);
    return { clamped: c, pct: p };
  }, [value, max]);

  return (
    <div
      className="progress-bar"
      data-testid={testId}
      role="progressbar"
      aria-label={ariaLabel ?? label ?? "Progress"}
      aria-valuemin={0}
      aria-valuemax={Number.isFinite(max) && max > 0 ? max : 0}
      aria-valuenow={clamped}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 120,
      }}
    >
      {label != null && (
        <span
          className="progress-bar-label"
          data-testid={testId ? `${testId}-label` : undefined}
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          {label}
        </span>
      )}
      <div
        className="progress-bar-track"
        style={{
          position: "relative",
          height: 8,
          width: "100%",
          minWidth: 120,
          borderRadius: 999,
          background: "rgba(148, 163, 184, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          className="progress-bar-fill"
          data-testid={testId ? `${testId}-fill` : undefined}
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #818cf8 0%, #a78bfa 100%)",
            borderRadius: 999,
            transition: "width 320ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .progress-bar-fill { transition: none !important; }
        }
      `}</style>
    </div>
  );
}

/**
 * Inspect an unknown game state and pull out a (value, max, label) triple
 * if the state exposes commonly-used progress keys. Returns null if no
 * usable progress signal is found.
 *
 * Recognized value keys: `questionIndex`, `round`, `turn`.
 * Recognized max keys:   `total`, `totalQuestions`, `questions`, `maxRounds`.
 * For solitaire-style decks, also recognizes `cardsRemaining` paired with a
 * deck size of 52.
 */
export function deriveProgress(
  state: unknown,
): { value: number; max: number; label: string } | null {
  if (state == null || typeof state !== "object") return null;
  const s = state as Record<string, unknown>;

  const num = (k: string): number | null => {
    const v = s[k];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  };

  // Quiz-style: questionIndex / total
  const qi = num("questionIndex");
  if (qi != null) {
    const total =
      num("totalQuestions") ?? num("total") ?? num("questions") ?? null;
    if (total != null && total > 0) {
      return {
        value: Math.min(qi + 1, total),
        max: total,
        label: `Question ${Math.min(qi + 1, total)} / ${total}`,
      };
    }
  }

  // Round-based: round / maxRounds
  const round = num("round");
  if (round != null) {
    const max = num("maxRounds") ?? num("totalRounds") ?? null;
    if (max != null && max > 0) {
      const v = Math.min(round, max);
      return { value: v, max, label: `Round ${v} / ${max}` };
    }
  }

  // Turn-based: turn / maxTurns
  const turn = num("turn");
  if (turn != null) {
    const max = num("maxTurns") ?? num("totalTurns") ?? null;
    if (max != null && max > 0) {
      const v = Math.min(turn, max);
      return { value: v, max, label: `Turn ${v} / ${max}` };
    }
  }

  // Solitaire-style: cardsRemaining out of a 52-card deck
  const remaining = num("cardsRemaining");
  if (remaining != null) {
    const dealt = Math.max(0, 52 - remaining);
    return {
      value: dealt,
      max: 52,
      label: `${remaining} cards left`,
    };
  }

  return null;
}

export default ProgressBar;
