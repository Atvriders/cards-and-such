import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PairsThemedState, PairsAction } from "./state.js";
import { isTerminal } from "./state.js";
import type { pairsThemedSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./PairsThemed.css";

type PairsSettings = SettingsOf<typeof pairsThemedSettings>;

export function PairsThemed({
  state,
  dispatch,
  onGameOver,
}: GameProps<PairsThemedState, PairsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.pendingMismatch && !terminal) {
      dismissTimerRef.current = setTimeout(() => {
        dispatch({ type: "dismiss-mismatch" } as PairsAction);
      }, 800);
    }
    return () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [state.pendingMismatch, terminal, dispatch]);

  const pairs = parseInt(state.settings.size, 10);
  const gridStyle = {
    gridTemplateColumns: `repeat(${state.cols}, 64px)`,
    gridTemplateRows: `repeat(${state.rows}, 64px)`,
  };

  return (
    <div className="pairs-themed">
      <div className="pairs-info">
        <span>Pairs: {state.matched}/{pairs}</span>
        <span>Attempts: {state.attempts}</span>
      </div>

      {terminal && (
        <div className="pairs-game-over">You won! Score: {terminal.score}</div>
      )}

      <div className="pairs-grid" style={gridStyle}>
        {Array.from({ length: state.rows * state.cols }, (_, idx) => {
          const cellState = state.state[idx]!;
          const symbol = state.symbols[idx]!;
          const isHidden = cellState === "hidden";

          return (
            <button
              key={idx}
              className={`pairs-cell ${cellState}`}
              onClick={() => { if (!terminal) dispatch({ type: "flip", index: idx } as PairsAction); }}
              disabled={!isHidden || !!terminal}
              aria-label={isHidden ? "Hidden card" : symbol}
            >
              {cellState !== "hidden" ? symbol : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
