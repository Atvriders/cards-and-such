import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SameGameState, SameGameAction, SameGameSettings } from "./state.js";
import { isTerminal, findGroup, COLS, ROWS } from "./state.js";
import "./SameGame.css";

const CELL_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6",
];

export function SameGame({
  state,
  dispatch,
}: GameProps<SameGameState, SameGameSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [hoverGroup, setHoverGroup] = useState<Set<string>>(new Set());

  function handleMouseEnter(row: number, col: number) {
    if (state.grid[row]![col] === null) { setHoverGroup(new Set()); return; }
    const group = findGroup(state.grid, row, col);
    if (group.length < 2) { setHoverGroup(new Set()); return; }
    setHoverGroup(new Set(group.map(([r, c]) => `${r},${c}`)));
  }

  function handleMouseLeave() {
    setHoverGroup(new Set());
  }

  function handleClick(row: number, col: number) {
    if (state.over) return;
    dispatch({ type: "click", row, col } as SameGameAction);
    setHoverGroup(new Set());
  }

  return (
    <div className="samegame-game">
      <div className="samegame-header">
        <span>Score: {state.score}</span>
      </div>

      <div className="samegame-board-wrapper">
        <div
          className="samegame-board"
          style={{ gridTemplateColumns: `repeat(${COLS}, 38px)`, gridTemplateRows: `repeat(${ROWS}, 38px)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const color = state.grid[r]![c] ?? null;
              const key = `${r},${c}`;
              const isHighlighted = hoverGroup.has(key);
              let cls = "samegame-cell";
              if (color === null) cls += " samegame-cell--empty";
              return (
                <div
                  key={key}
                  className={cls}
                  style={{
                    background: color !== null ? (CELL_COLORS[color % CELL_COLORS.length] ?? "#888") : undefined,
                    filter: isHighlighted ? "brightness(1.5)" : undefined,
                    transform: isHighlighted ? "scale(1.08)" : undefined,
                    zIndex: isHighlighted ? 1 : undefined,
                  }}
                  onClick={() => handleClick(r, c)}
                  onMouseEnter={() => handleMouseEnter(r, c)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })
          )}
        </div>

        {terminal && (
          <div className="samegame-overlay">
            <h2>{state.grid.flat().every((c) => c === null) ? "Board Cleared!" : "No Moves Left"}</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="samegame-hint">
        Click a group of 2+ same-color blocks to remove them. Clear the board for a bonus!
      </div>
    </div>
  );
}
