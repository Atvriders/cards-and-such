import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BinaryPuzzleState, BinaryPuzzleSettings, BinaryPuzzleAction, BinaryCell } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BinaryPuzzleGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BinaryPuzzleState, BinaryPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleClick = useCallback(
    (index: number) => {
      if (terminal) return;
      if (state.clues[index]) return;
      // Cycle: null → 0 → 1 → null
      const current = state.board[index];
      let next: BinaryCell;
      if (current === null) next = 0;
      else if (current === 0) next = 1;
      else next = null;
      dispatch({ type: "set", index, value: next } as BinaryPuzzleAction);
    },
    [dispatch, terminal, state.board, state.clues],
  );

  const { size, board, clues } = state;

  return (
    <div className="binary-puzzle">
      <div className="binary-puzzle-info">
        <span>Grid: {size}×{size}</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className={`binary-puzzle-status${state.won ? " win" : ""}`}>
        {state.won ? "Puzzle solved!" : "Fill the grid with 0s and 1s"}
      </div>

      <div
        className="binary-puzzle-grid"
        style={{ gridTemplateColumns: `repeat(${size}, 40px)` }}
      >
        {board.map((cell, i) => {
          const isClue = clues[i]!;
          let cls = "binary-puzzle-cell";
          if (isClue) cls += " clue";
          if (cell === null) cls += " empty";
          else if (cell === 0) cls += " zero";
          else cls += " one";
          return (
            <div key={i} className={cls} onClick={() => handleClick(i)}>
              {cell === null ? "" : cell}
            </div>
          );
        })}
      </div>

      <ul className="binary-puzzle-rules">
        <li>No three same digits in a row or column</li>
        <li>Equal number of 0s and 1s in each row and column</li>
        <li>No two rows or columns are identical</li>
      </ul>

      <p className="binary-puzzle-hint">Click empty cells to cycle: blank → 0 → 1 → blank</p>
    </div>
  );
}
