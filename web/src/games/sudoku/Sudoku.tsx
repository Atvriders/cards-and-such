import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SudokuState, SudokuAction, SudokuSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Sudoku.css";

export function Sudoku({
  state,
  dispatch,
  onGameOver,
}: GameProps<SudokuState, SudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const handleCellClick = useCallback(
    (idx: number) => {
      if (terminal) return;
      dispatch({ type: "select", index: state.selected === idx ? null : idx } as SudokuAction);
    },
    [dispatch, state.selected, terminal],
  );

  const handleDigit = useCallback(
    (digit: number) => {
      if (terminal) return;
      dispatch({ type: "enter", digit } as SudokuAction);
    },
    [dispatch, terminal],
  );

  const handleHint = useCallback(() => {
    if (terminal) return;
    dispatch({ type: "hint" } as SudokuAction);
  }, [dispatch, terminal]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (terminal) return;
      if (e.key >= "1" && e.key <= "9") {
        dispatch({ type: "enter", digit: parseInt(e.key, 10) } as SudokuAction);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "enter", digit: 0 } as SudokuAction);
      } else if (e.key === "ArrowRight") {
        const cur = state.selected;
        if (cur !== null && cur % 9 < 8) {
          dispatch({ type: "select", index: cur + 1 } as SudokuAction);
        } else if (cur === null) {
          dispatch({ type: "select", index: 0 } as SudokuAction);
        }
      } else if (e.key === "ArrowLeft") {
        const cur = state.selected;
        if (cur !== null && cur % 9 > 0) {
          dispatch({ type: "select", index: cur - 1 } as SudokuAction);
        }
      } else if (e.key === "ArrowDown") {
        const cur = state.selected;
        if (cur !== null && cur < 72) {
          dispatch({ type: "select", index: cur + 9 } as SudokuAction);
        }
      } else if (e.key === "ArrowUp") {
        const cur = state.selected;
        if (cur !== null && cur >= 9) {
          dispatch({ type: "select", index: cur - 9 } as SudokuAction);
        }
      }
    },
    [dispatch, state.selected, terminal],
  );

  const errorSet = new Set(state.errorCells);

  // Highlight cells in the same row/col/box as selected
  const highlightSet = new Set<number>();
  if (state.selected !== null) {
    const selR = Math.floor(state.selected / 9);
    const selC = state.selected % 9;
    const selBoxR = Math.floor(selR / 3) * 3;
    const selBoxC = Math.floor(selC / 3) * 3;
    for (let i = 0; i < 9; i++) {
      highlightSet.add(selR * 9 + i);      // same row
      highlightSet.add(i * 9 + selC);      // same col
    }
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        highlightSet.add((selBoxR + dr) * 9 + (selBoxC + dc)); // same box
      }
    }
  }

  return (
    <div className="sudoku" tabIndex={0} onKeyDown={handleKeyDown}>
      <div className="sudoku-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Hints: {state.hintsUsed}</span>
      </div>

      {terminal && (
        <div className="sudoku-game-over">
          Puzzle Solved! Score: {terminal.score}
        </div>
      )}

      <div className="sudoku-grid">
        {Array.from({ length: 81 }, (_, idx) => {
          const row = Math.floor(idx / 9);
          const col = idx % 9;
          const val = state.current[idx]!;
          const isGiven = state.given[idx] !== 0;
          const isSelected = state.selected === idx;
          const isError = errorSet.has(idx);
          const isHighlighted = highlightSet.has(idx) && !isSelected;

          let className = "sudoku-cell";
          if (isGiven) className += " given";
          else if (val !== 0) className += " player";
          if (isSelected) className += " selected";
          if (isError) className += " error";
          else if (isHighlighted) className += " hint-group";

          return (
            <div
              key={idx}
              className={className}
              data-row={row}
              data-col={col}
              onClick={() => handleCellClick(idx)}
            >
              {val !== 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="sudoku-numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} disabled={!!terminal}>
            {d}
          </button>
        ))}
        <button className="erase" onClick={() => handleDigit(0)} disabled={!!terminal}>
          ✕
        </button>
      </div>

      <div className="sudoku-controls">
        <button onClick={handleHint} disabled={!!terminal}>
          Hint
        </button>
      </div>
    </div>
  );
}
