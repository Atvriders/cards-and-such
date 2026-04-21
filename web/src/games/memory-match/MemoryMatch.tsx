import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MemoryMatchState } from "./state.js";
import { isTerminal } from "./state.js";
import type { memoryMatchSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MemoryMatch.css";

type MemoryMatchSettings = SettingsOf<typeof memoryMatchSettings>;

export function MemoryMatch({
  state,
  dispatch,
  onGameOver,
}: GameProps<MemoryMatchState, MemoryMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Report game over
  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-dismiss mismatch after 800ms
  useEffect(() => {
    if (state.pendingMismatch && !terminal) {
      dismissTimerRef.current = setTimeout(() => {
        dispatch({ type: "dismiss-mismatch" });
      }, 800);
    }
    return () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [state.pendingMismatch, terminal, dispatch]);

  const handleCellClick = (index: number) => {
    if (terminal) return;
    dispatch({ type: "flip", index });
  };

  const pairs = parseInt(state.settings.size, 10);
  const gridStyle = {
    gridTemplateColumns: `repeat(${state.cols}, 64px)`,
    gridTemplateRows: `repeat(${state.rows}, 64px)`,
  };

  return (
    <div className="memory-match">
      <div className="memory-match-info">
        <span>Pairs: {state.matched}/{pairs}</span>
        <span>Attempts: {state.attempts}</span>
      </div>

      {terminal && (
        <div className="memory-match-game-over">
          You won! Score: {terminal.score}
        </div>
      )}

      <div className="memory-match-grid" style={gridStyle}>
        {Array.from({ length: state.rows * state.cols }, (_, idx) => {
          const cellState = state.state[idx]!;
          const symbol = state.symbols[idx]!;
          const isHidden = cellState === "hidden";

          return (
            <button
              key={idx}
              className={`memory-match-cell ${cellState}`}
              onClick={() => handleCellClick(idx)}
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
