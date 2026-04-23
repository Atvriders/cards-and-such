import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DominoState, DominoSettings } from "./state.js";
import type { DominoAction } from "./state.js";
import { isTerminal, wallKey } from "./state.js";
import "./DominoPlacement.css";

export function DominoPlacement({ state, dispatch, onGameOver }: GameProps<DominoState, DominoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, walls, won } = state;
  const { rows, cols, grid } = puzzle;

  const COLORS = ["#ff9800","#4caf50","#2196f3","#9c27b0","#f44336","#00bcd4","#ff5722","#8bc34a","#ffc107","#3f51b5"];

  return (
    <div className="domino-placement">
      <div className="domino-placement-title">Domino Placement</div>
      <div className={`domino-placement-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Walls placed: ${walls.size} | Moves: ${state.moves}`}
      </div>

      <div
        className="domino-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 38px)` }}
      >
        {Array.from({ length: rows * cols }, (_, idx) => {
          const r = Math.floor(idx / cols);
          const c = idx % cols;
          const v = grid[idx]!;
          const hasRight = c + 1 < cols;
          const hasDown = r + 1 < rows;
          const rightKey = hasRight ? wallKey(idx, idx + 1) : "";
          const downKey = hasDown ? wallKey(idx, idx + cols) : "";
          const rightWall = hasRight && walls.has(rightKey);
          const downWall = hasDown && walls.has(downKey);

          return (
            <div key={idx} className="domino-cell" style={{ background: COLORS[v] + "22", color: COLORS[v], borderColor: "#ccc" }}>
              {v}
              {hasRight && (
                <div
                  className={`domino-wall-right ${rightWall ? "active" : "inactive"}`}
                  onClick={() => !won && dispatch({ type: "toggleWall", idx1: idx, idx2: idx + 1 } satisfies DominoAction)}
                />
              )}
              {hasDown && (
                <div
                  className={`domino-wall-down ${downWall ? "active" : "inactive"}`}
                  onClick={() => !won && dispatch({ type: "toggleWall", idx1: idx, idx2: idx + cols } satisfies DominoAction)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="domino-placement-hint">
        Click the dividers between cells to place walls. Each pair of cells separated from all others forms a domino.
        Use all 28 dominoes (0-0 through 6-6) exactly once.
      </div>

      <div className="domino-placement-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
