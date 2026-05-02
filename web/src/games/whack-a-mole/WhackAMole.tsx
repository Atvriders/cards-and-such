import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhackAMoleState } from "./state.js";
import { isTerminal } from "./state.js";
import type { whackAMoleSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./WhackAMole.css";

type WhackAMoleSettings = SettingsOf<typeof whackAMoleSettings>;

export function WhackAMole({
  state,
  dispatch,
  onGameOver,
}: GameProps<WhackAMoleState, WhackAMoleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  const gridSize = parseInt(state.settings.grid, 10);
  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;

  return (
    <div className="whack-a-mole">
      <div className="wam-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(1)}s</strong></span>
      </div>

      <div className="wam-timer-bar">
        <div className="wam-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      {terminal && (
        <div className="wam-ended">Game over! Final score: {terminal.score}</div>
      )}

      <div
        className="wam-grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 80px)` }}
      >
        {state.holes.map((hole, idx) => (
          <button
            key={idx}
            className={`wam-hole ${hole.kind}`}
            data-testid={`hint-target-wam-${idx}`}
            onClick={() => dispatch({ type: "whack", index: idx })}
            disabled={hole.kind === "empty" || !!terminal}
            aria-label={hole.kind === "mole" ? "Whack mole!" : "Empty hole"}
          >
            {hole.kind === "mole" ? "🐭" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
