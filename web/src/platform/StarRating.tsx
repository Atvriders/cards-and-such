import { useState, useCallback, useMemo } from "react";
import "./StarRating.css";

export interface StarRatingProps {
  /** Currently selected rating, 0–5 (0 means unrated). */
  value: number;
  /** Called when the user picks a rating. Omit to render read-only. */
  onChange?: (value: number) => void;
  /** Force read-only mode regardless of `onChange`. */
  readOnly?: boolean;
  /** Optional accessible label — defaults to "Rate this game". */
  ariaLabel?: string;
  /** Compact variant — smaller stars, no hover preview. */
  size?: "sm" | "md";
  /** Optional test id used as the radiogroup root. */
  testId?: string;
}

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * 5-star rating widget. Rendered as a radiogroup of buttons so it works
 * with screen readers and keyboards out of the box. Hover preview lights
 * up stars under the cursor; arrow keys nudge the value when interactive.
 */
export function StarRating({
  value,
  onChange,
  readOnly = false,
  ariaLabel = "Rate this game",
  size = "md",
  testId,
}: StarRatingProps): JSX.Element {
  const [hover, setHover] = useState<number>(0);
  const interactive = !readOnly && typeof onChange === "function";

  const display = useMemo(() => {
    if (interactive && hover > 0) return hover;
    return value;
  }, [interactive, hover, value]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        onChange?.(Math.min(5, (value || 0) + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        onChange?.(Math.max(0, (value || 0) - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        onChange?.(1);
      } else if (e.key === "End") {
        e.preventDefault();
        onChange?.(5);
      } else if (e.key === "0" || e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onChange?.(0);
      }
    },
    [interactive, onChange, value],
  );

  return (
    <div
      className={`star-rating star-rating--${size}${interactive ? " is-interactive" : " is-readonly"}`}
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={testId}
      data-value={value}
      onMouseLeave={() => setHover(0)}
      onKeyDown={onKeyDown}
      tabIndex={interactive ? 0 : -1}
    >
      {STARS.map((n) => {
        const filled = n <= display;
        const selected = n === value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            className={`star-rating-star${filled ? " is-filled" : ""}`}
            disabled={!interactive}
            tabIndex={-1}
            onMouseEnter={() => interactive && setHover(n)}
            onFocus={() => interactive && setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => {
              if (!interactive) return;
              // Click on the already-selected star clears the rating.
              onChange?.(value === n ? 0 : n);
            }}
            data-testid={testId ? `${testId}-star-${n}` : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.7l-5.88 3.01 1.12-6.55-4.76-4.64 6.58-.96L12 2.6z"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

/* ----- localStorage helpers (also exported for reuse + tests) ----- */

const RATINGS_KEY = "cards-ratings";

export function readRatings(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(RATINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function readRating(gameId: string): number {
  const all = readRatings();
  const v = all[gameId];
  return typeof v === "number" && v >= 1 && v <= 5 ? v : 0;
}

export function writeRating(gameId: string, value: number): void {
  try {
    if (typeof localStorage === "undefined") return;
    const all = readRatings();
    if (value <= 0) delete all[gameId];
    else all[gameId] = Math.max(1, Math.min(5, Math.round(value)));
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export default StarRating;
