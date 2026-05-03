import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShakaState, ShakaSettings, TriangleDir } from "./state.js";
import type { ShakaAction } from "./state.js";
import { isTerminal, ALL_DIRS } from "./state.js";
import "./Shakashaka.css";

export function Shakashaka({ state, dispatch, onGameOver }: GameProps<ShakaState, ShakaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, triangles, selectedDir, won } = state;
  const { rows, cols, grid } = puzzle;

  function handleClick(idx: number): void {
    if (won) return;
    if (grid[idx] !== null) return;
    if (triangles[idx] !== undefined) {
      dispatch({ type: "clearTri", idx } satisfies ShakaAction);
    } else {
      dispatch({ type: "placeTri", idx } satisfies ShakaAction);
    }
  }

  return (
    <div className="shaka">
      <div className="shaka-title">Shakashaka</div>
      <div className={`shaka-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Place triangles so all white regions form rectangles. Moves: ${state.moves}`}
      </div>

      <div className="shaka-toolbar">
        <span>Place:</span>
        {ALL_DIRS.map(d => (
          <button
            key={d}
            className={selectedDir === d ? "active" : ""}
            title={d}
            onClick={() => dispatch({ type: "selectDir", dir: d } satisfies ShakaAction)}
          >
            <div className={`btn-tri ${d}`} />
          </button>
        ))}
      </div>

      <div className="shaka-grid" style={{ gridTemplateColumns: `repeat(${cols}, 52px)` }}>
        {Array.from({ length: rows * cols }, (_, idx) => {
          const clue = grid[idx];
          if (clue !== null && clue !== undefined) {
            return (
              <div key={idx} className="shaka-cell black">
                {clue >= 0 ? clue : ""}
              </div>
            );
          }
          const tri = triangles[idx];
          const isCorrect = tri !== undefined && tri === puzzle.solution[idx];
          return (
            <div
              key={idx}
              className={`shaka-cell${isCorrect ? " correct" : ""}`}
              onClick={() => handleClick(idx)}
            >
              {tri !== undefined && tri !== null && (
                <div className={`shaka-tri ${tri as TriangleDir}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="shaka-hint">Select a triangle direction above, then click a white cell to place it. Click again to remove.</div>

      <div className="shaka-btns">
        <button data-testid="hint-target-shakashaka-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
