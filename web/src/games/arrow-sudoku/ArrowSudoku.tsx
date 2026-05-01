import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArrowSudokuState, ArrowSudokuSettings, ArrowSudokuAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./ArrowSudoku.css";

export function ArrowSudoku({ state, dispatch, onGameOver }: GameProps<ArrowSudokuState, ArrowSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, board, selected, won } = state;
  const N = 6;

  const headSet = new Set(puzzle.arrows.map(a => a.head));
  const shaftSet = new Set(puzzle.arrows.flatMap(a => a.shaft));

  // Conflict detection: find cells in same row/col with same value
  const conflictSet = new Set<number>();
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      for (let k = j + 1; k < N; k++) {
        const idxJ = i * N + j;
        const idxK = i * N + k;
        if (board[idxJ] !== 0 && board[idxJ] === board[idxK]) {
          conflictSet.add(idxJ);
          conflictSet.add(idxK);
        }
        const ridxJ = j * N + i;
        const ridxK = k * N + i;
        if (board[ridxJ] !== 0 && board[ridxJ] === board[ridxK]) {
          conflictSet.add(ridxJ);
          conflictSet.add(ridxK);
        }
      }
    }
  }

  return (
    <div className="arrowarchery-sudoku">
      <div className="arrowarchery-sudoku-title">Arrow Sudoku</div>
      <div className={`arrowarchery-sudoku-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill 1-6; circle digit = sum of arrowarchery`}
      </div>

      <div className="arrowarchery-sudoku-grid">
        {Array.from({ length: N * N }, (_, idx) => {
          const given = puzzle.givens[idx] !== 0;
          const isHead = headSet.has(idx);
          const isShaft = shaftSet.has(idx);
          const isSelected = selected === idx;
          const isConflict = conflictSet.has(idx);
          const val = board[idx];

          const classes = [
            "as-cell",
            given ? "given" : "",
            isSelected ? "selected" : "",
            isHead && !given ? "arrowarchery-head" : "",
            isShaft && !given && !isHead ? "arrowarchery-shaft" : "",
            isConflict ? "conflict" : "",
            won ? "won-cell" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={idx}
              className={classes}
              onClick={() => !won && !given && dispatch({ type: "selectCell", idx } satisfies ArrowSudokuAction)}
            >
              {val !== 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="arrowarchery-sudoku-numpad">
        {[1, 2, 3, 4, 5, 6].map(d => (
          <button
            key={d}
            onClick={() => dispatch({ type: "enterDigit", digit: d } satisfies ArrowSudokuAction)}
          >
            {d}
          </button>
        ))}
        <button onClick={() => dispatch({ type: "clearCell" } satisfies ArrowSudokuAction)}>X</button>
      </div>

      <div className="arrowarchery-sudoku-btns">
        <button onClick={() => dispatch({ type: "reset" } satisfies ArrowSudokuAction)}>Reset</button>
      </div>
    </div>
  );
}
