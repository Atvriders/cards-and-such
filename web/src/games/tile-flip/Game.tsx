import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TileFlipState, TileFlipSettings } from "./state.js";
import type { TileFlipAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TileFlip({
  state,
  dispatch,
  onGameOver,
}: GameProps<TileFlipState, TileFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleFlip(row: number, col: number) {
    if (state.won) return;
    dispatch({ type: "flip", row, col } as TileFlipAction);
  }

  const cols = `repeat(${state.size}, 56px)`;

  return (
    <div className="tile-flip">
      <div className="tile-flip-info">
        <span>{state.size}×{state.size} grid</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className="tile-flip-status">
        {state.won ? "Matched — You win!" : "Flip tiles to match the target pattern"}
      </div>
      <div className="tile-flip-boards">
        <div>
          <div className="tile-flip-board-label">Your Board</div>
          <div className="tile-flip-grid" style={{ gridTemplateColumns: cols }}>
            {Array.from({ length: state.size }, (_, row) =>
              Array.from({ length: state.size }, (_, col) => (
                <button data-testid="hint-target-tile-flip-action"
                  key={`${row}-${col}`}
                  className="tile-flip-cell"
                  data-v={state.grid[row * state.size + col]}
                  onClick={() => handleFlip(row, col)}
                  disabled={state.won}
                  aria-label={`Cell ${row + 1},${col + 1} color ${state.grid[row * state.size + col]}`}
                />
              ))
            )}
          </div>
        </div>
        <div>
          <div className="tile-flip-board-label">Target</div>
          <div className="tile-flip-grid" style={{ gridTemplateColumns: cols }}>
            {Array.from({ length: state.size }, (_, row) =>
              Array.from({ length: state.size }, (_, col) => (
                <div
                  key={`${row}-${col}`}
                  className="tile-flip-cell readonly"
                  data-v={state.target[row * state.size + col]}
                  aria-label={`Target ${row + 1},${col + 1} color ${state.target[row * state.size + col]}`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
