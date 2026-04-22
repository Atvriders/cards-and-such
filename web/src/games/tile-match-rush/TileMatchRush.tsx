import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TileMatchRushState, TileMatchRushAction } from "./state.js";
import { isTerminal } from "./state.js";
import type { tileMatchRushSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TileMatchRush.css";

type TileMatchSettings = SettingsOf<typeof tileMatchRushSettings>;

export function TileMatchRush({
  state,
  dispatch,
  onGameOver,
}: GameProps<TileMatchRushState, TileMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now() - state.elapsed * 1000;
    }

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current!) / 1000;
      dispatch({ type: "tick" as const, elapsed } as TileMatchRushAction);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [terminal, dispatch, state.elapsed]);

  const handleClick = (cellIdx: number) => {
    if (terminal) return;
    if (state.grid[cellIdx] === null) return;
    dispatch({ type: "select" as const, idx: cellIdx } as TileMatchRushAction);
  };

  const timeLeft = Math.max(0, state.duration - Math.floor(state.elapsed));
  const timerClass = timeLeft <= 10 ? "tmr-timer" : "tmr-timer safe";

  const gridStyle = {
    gridTemplateColumns: `repeat(${state.cols}, 42px)`,
    gridTemplateRows: `repeat(${state.rows}, 50px)`,
  };

  return (
    <div className="tile-match-rush">
      <div className="tmr-info">
        <span className={timerClass}>⏱ {timeLeft}s</span>
        <span>Score: {state.score}</span>
        <span>Pairs: {state.removed / 2}/{state.total / 2}</span>
        {state.combo > 1 && (
          <span className="tmr-combo">🔥 x{state.combo} combo!</span>
        )}
      </div>

      {terminal && (
        <div className="tmr-status">
          {state.won ? "Board cleared!" : "Time up!"} Final score: {terminal.score}
        </div>
      )}

      <div className="tmr-grid" style={gridStyle}>
        {state.grid.map((face, cellIdx) => {
          const empty = face === null;
          const isSelected = state.selectedIdx === cellIdx;
          let cls = "tmr-cell";
          if (empty) cls += " empty";
          else {
            cls += " tile";
            if (isSelected) cls += " selected";
          }

          return (
            <button
              key={cellIdx}
              className={cls}
              onClick={() => handleClick(cellIdx)}
              disabled={empty || !!terminal}
              aria-label={face ?? "empty"}
            >
              {face}
            </button>
          );
        })}
      </div>
    </div>
  );
}
