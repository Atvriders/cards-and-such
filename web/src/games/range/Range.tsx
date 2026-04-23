import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RangeState, RangeSettings } from "./state.js";
import type { RangeAction } from "./state.js";
import { isTerminal, computeRange } from "./state.js";
import "./Range.css";

export function Range({ state, dispatch, onGameOver }: GameProps<RangeState, RangeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, shaded, won } = state;
  const { rows, cols, grid } = puzzle;

  return (
    <div className="range-game">
      <div className="range-title">Range</div>
      <div className={`range-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Shade cells so each number sees exactly that many white cells. Moves: ${state.moves}`}
      </div>

      <div className="range-grid" style={{ gridTemplateColumns: `repeat(${cols}, 48px)` }}>
        {Array.from({ length: rows * cols }, (_, idx) => {
          const r = Math.floor(idx / cols), c = idx % cols;
          const clue = grid[idx];
          const isShaded = shaded[idx];
          if (clue !== null) {
            const seen = computeRange(puzzle, shaded, r, c);
            const wrong = !won && seen !== clue;
            return (
              <div key={idx} className={`range-cell numbered${wrong ? " wrong" : ""}`}>
                {clue}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={`range-cell${isShaded ? " shaded" : ""}`}
              onClick={() => !won && dispatch({ type: "toggleShade", idx } satisfies RangeAction)}
            >
              {isShaded ? "■" : ""}
            </div>
          );
        })}
      </div>

      <div className="range-hint">Click blank cells to shade them black. Numbered cells show how many white cells they can see in 4 directions (including themselves).</div>

      <div className="range-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
