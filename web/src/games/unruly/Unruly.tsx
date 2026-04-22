import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnrulyState, UnrulyAction, UnrulySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Unruly.css";

export function Unruly({
  state,
  dispatch,
  onGameOver,
}: GameProps<UnrulyState, UnrulySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleCell = useCallback(
    (index: number) => {
      if (terminal) return;
      dispatch({ type: "toggle", index } as UnrulyAction);
    },
    [dispatch, terminal],
  );

  const n = state.puzzle.size;
  const errorSet = new Set(state.errorCells);

  return (
    <div className="unruly">
      <div className="unruly-info">
        <span>Size: {n}×{n}</span>
        <span>Moves: {state.movesMade}</span>
        <span>
          Filled: {state.current.filter((v) => v !== 0).length}/{n * n}
        </span>
      </div>

      {terminal && (
        <div className="unruly-game-over">Solved! Score: {terminal.score}</div>
      )}

      <div
        className="unruly-grid"
        style={{ gridTemplateColumns: `repeat(${n}, 44px)` }}
      >
        {state.current.map((val, idx) => {
          const isGiven = state.puzzle.given[idx] !== 0;
          const isError = errorSet.has(idx);
          const colorClass = val === 1 ? "black" : val === 2 ? "white" : "empty";
          const givenClass = isGiven ? " given" : "";
          const errorClass = isError ? " error" : "";

          return (
            <div
              key={idx}
              className={`unruly-cell ${colorClass}${givenClass}${errorClass}`}
              onClick={() => handleCell(idx)}
              title={isGiven ? "Given (locked)" : "Click to cycle: empty → black → white → empty"}
            >
              {val === 1 ? "■" : val === 2 ? "□" : ""}
            </div>
          );
        })}
      </div>

      <div className="unruly-legend">
        <span>■ = Black</span>
        <span>□ = White</span>
        <span>Click to cycle</span>
      </div>
    </div>
  );
}
