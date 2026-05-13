import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorLinesState, ColorLinesSettings } from "./state.js";
import { isTerminal, GRID_SIZE } from "./state.js";
import "./ColorLines.css";

const BALL_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22",
];

export function ColorLines({ state, dispatch, onGameOver }: GameProps<ColorLinesState, ColorLinesSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const terminal = isTerminal(state);
  const size = GRID_SIZE;

  function handleCellClick(idx: number) {
    if (state.over) return;
    if (state.grid[idx] !== null) {
      dispatch({ type: "select", idx });
    } else if (state.selected !== null) {
      dispatch({ type: "move", idx });
    }
  }

  return (
    <div className="colorlines-game">
      <div className="colorlines-header">Score: {state.score}</div>

      <div className="colorlines-board" style={{ gridTemplateColumns: `repeat(${size}, 44px)` }}>
        {state.grid.map((cell, i) => (
          <div
            key={i}
            className={`colorlines-cell${state.selected === i ? " colorlines-cell--selected" : ""}`}
            onClick={() => handleCellClick(i)}
          >
            {cell !== null && (
              <div
                className="colorlines-ball"
                style={{ background: BALL_COLORS[cell % BALL_COLORS.length] }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="colorlines-preview">
        <span>Next:</span>
        {state.nextColors.map((c, i) => (
          <div
            key={i}
            className="colorlines-preview-ball"
            style={{ background: BALL_COLORS[c % BALL_COLORS.length] }}
          />
        ))}
      </div>

      {terminal && (
        <div className="colorlines-overlay">
          <h2>Board Full</h2>
          <p>Final Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
