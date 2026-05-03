import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BubblePopState, BubblePopAction, BubbleColor } from "./state.js";
import { isTerminal, COLS } from "./state.js";
import "./Game.css";

const COLOR_HEX: Record<BubbleColor, string> = {
  red: "#e04040",
  blue: "#4080e0",
  green: "#40b050",
  yellow: "#d0b020",
  purple: "#9050d0",
};

type Settings = { colors: "3" | "4" | "5" };

export function BubblePopChain({ state, dispatch }: GameProps<BubblePopState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
        dispatch({ type: "tick", dt } as BubblePopAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTimeRef.current = null; }
    };
  }, [state.over, tick]);

  const terminal = isTerminal(state);
  const { grid, score, moveTimer, moveInterval } = state;
  const timerPct = (moveTimer / moveInterval) * 100;

  return (
    <div className="bpc-game">
      <div className="bpc-header">
        <span>Score: {score}</span>
        <span>Next row in: {Math.ceil(moveInterval - moveTimer)}s</span>
      </div>

      <div className="bpc-timer">
        <div className="bpc-timer-bar" style={{ width: `${timerPct}%` }} />
      </div>

      <div
        className="bpc-grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 44px)` }}
      >
        {grid.map((row, r) =>
          row.map((bubble, c) => (
            <div data-testid="hint-target-bubble-pop-chain-action"
              key={bubble.id}
              className={`bpc-cell${!bubble.alive ? " bpc-cell--dead" : ""}`}
              style={{ background: bubble.alive ? COLOR_HEX[bubble.color] : undefined }}
              onClick={() => dispatch({ type: "pop", row: r, col: c } as BubblePopAction)}
            />
          ))
        )}
      </div>

      {terminal && (
        <div className="bpc-overlay">
          <h2>Overflow!</h2>
          <p>Score: {terminal.score}</p>
        </div>
      )}

      <div className="bpc-hint">Click groups of 2+ same-color bubbles to pop them · Don't let them overflow!</div>
    </div>
  );
}
