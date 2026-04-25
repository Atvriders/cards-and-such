import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DotGridPuzzleState, DotGridPuzzleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DotGridPuzzle.css";

export function DotGridPuzzle({ state, dispatch, onGameOver }: GameProps<DotGridPuzzleState, DotGridPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="dot-grid-puzzle">
      <div className="dgp-info">
        <span>Grid: {state.size}×{state.size}</span>
        <span>Dots to visit: {state.dots.length}</span>
        <span>Path length: {state.path.length}</span>
        <span>Moves: {state.moves}</span>
      </div>

      {state.solved && <div className="dgp-win">All dots connected! Puzzle solved!</div>}

      <div
        className="dgp-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 50px)` }}
      >
        {state.grid.map((cell, i) => (
          <div
            key={i}
            className={`dgp-cell ${cell}`}
            onClick={() => !state.solved && dispatch({ type: "clickCell", idx: i })}
          />
        ))}
      </div>

      <div className="dgp-controls">
        <button onClick={() => dispatch({ type: "reset" })}>Reset Path</button>
        <button onClick={() => dispatch({ type: "restart" })}>New Puzzle</button>
      </div>

      <div className="dgp-hint">
        Click a cell to start your path · Click adjacent cells to extend · Click last cell to backtrack · Visit all ⚫ dots
      </div>
    </div>
  );
}
