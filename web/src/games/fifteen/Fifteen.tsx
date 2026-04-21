import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleSettings } from "./state.js";
import type { FifteenPuzzleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Fifteen.css";

export function Fifteen({
  state,
  dispatch,
  onGameOver,
}: GameProps<FifteenPuzzleState, FifteenPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { size, tiles, emptyIndex } = state;
  const tileSize = size <= 3 ? 80 : size === 4 ? 72 : 60;

  function isAdj(idx: number): boolean {
    const er = Math.floor(emptyIndex / size);
    const ec = emptyIndex % size;
    const tr = Math.floor(idx / size);
    const tc = idx % size;
    return (
      (er === tr && Math.abs(ec - tc) === 1) ||
      (ec === tc && Math.abs(er - tr) === 1)
    );
  }

  return (
    <div className="fifteen">
      <div className="fifteen-info">
        <span>{size}×{size} puzzle</span>
        <span>Shuffle: {state.settings.shuffleMoves} moves</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className={`fifteen-status ${state.won ? "win" : ""}`}>
        {state.won ? "Puzzle solved! You win!" : "Slide tiles to arrange in order"}
      </div>

      <div
        className="fifteen-grid"
        style={{ gridTemplateColumns: `repeat(${size}, ${tileSize}px)` }}
      >
        {tiles.map((tile, idx) => {
          const isEmpty = tile === 0;
          const inPlace = !isEmpty && tile === idx + 1;
          const adjacent = !isEmpty && isAdj(idx);
          return (
            <button
              key={idx}
              className={`fifteen-tile ${isEmpty ? "empty" : inPlace ? "in-place" : "number"}`}
              style={{ width: tileSize, height: tileSize }}
              onClick={() => {
                if (!isEmpty && adjacent && !state.won) {
                  dispatch({ type: "slide", index: idx } as FifteenPuzzleAction);
                }
              }}
              disabled={isEmpty || !adjacent || state.won}
              aria-label={isEmpty ? "empty" : `tile ${tile}`}
            >
              {isEmpty ? "" : tile}
            </button>
          );
        })}
      </div>
    </div>
  );
}
