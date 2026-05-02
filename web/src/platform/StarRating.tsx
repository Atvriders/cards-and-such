import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  const [saved, setSaved] = useState<boolean>(false);
  const savedTimer = useRef<number | null>(null);
  const interactive = !readOnly && typeof onChange === "function";

  // Cleanup the "Saved" toast timer on unmount so a late-fired callback
  // doesn't try to set state on a torn-down component.
  useEffect(() => {
    return () => {
      if (savedTimer.current !== null) {
        window.clearTimeout(savedTimer.current);
        savedTimer.current = null;
      }
    };
  }, []);

  /**
   * Wraps `onChange` with a 1.5s "Saved" indicator that briefly replaces
   * the stars in-place after the user picks a rating ≥ 1. Selecting "0"
   * (clearing the rating by re-clicking the same star) skips the toast
   * since there's nothing to confirm.
   */
  const handleChange = useCallback(
    (next: number) => {
      onChange?.(next);
      if (next >= 1) {
        if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
        setSaved(true);
        savedTimer.current = window.setTimeout(() => {
          setSaved(false);
          savedTimer.current = null;
        }, 1500);
      } else {
        if (savedTimer.current !== null) {
          window.clearTimeout(savedTimer.current);
          savedTimer.current = null;
        }
        setSaved(false);
      }
    },
    [onChange],
  );

  const display = useMemo(() => {
    if (interactive && hover > 0) return hover;
    return value;
  }, [interactive, hover, value]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        handleChange(Math.min(5, (value || 0) + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        handleChange(Math.max(0, (value || 0) - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        handleChange(1);
      } else if (e.key === "End") {
        e.preventDefault();
        handleChange(5);
      } else if (e.key === "0" || e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        handleChange(0);
      }
    },
    [interactive, handleChange, value],
  );

  if (saved && interactive) {
    // The "Saved" indicator visually replaces the stars in-place for
    // 1.5s, but we keep the same outer role + testid + keyboard wiring
    // so callers (and tests) can keep nudging the rating with arrow
    // keys mid-toast without having to wait for the stars to come back.
    return (
      <div
        className={`star-rating star-rating--${size} star-rating--saved is-interactive`}
        role="radiogroup"
        aria-label={ariaLabel}
        data-testid={testId}
        data-value={value}
        data-saved="true"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <span className="star-rating-saved" data-testid={testId ? `${testId}-saved` : undefined}>
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            aria-hidden="true"
            focusable="false"
            className="star-rating-saved-check"
          >
            <path
              d="M5 12.5l4.2 4.2L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Saved
        </span>
      </div>
    );
  }

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
              handleChange(value === n ? 0 : n);
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
