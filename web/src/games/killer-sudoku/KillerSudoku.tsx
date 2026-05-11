import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KillerSudokuState, KillerSudokuAction, KillerSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./KillerSudoku.css";

export function KillerSudoku({
  state,
  dispatch,
  onGameOver,
}: GameProps<KillerSudokuState, KillerSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleCell = useCallback(
    (idx: number) => {
      if (terminal || state.solved) return;
      dispatch({ type: "select", index: state.selected === idx ? null : idx } satisfies KillerSudokuAction);
    },
    [dispatch, state.selected, state.solved, terminal],
  );

  const handleDigit = useCallback(
    (d: number) => {
      if (terminal) return;
      dispatch({ type: "enter", digit: d } satisfies KillerSudokuAction);
    },
    [dispatch, terminal],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (terminal) return;
      if (e.key >= "1" && e.key <= String(MAX_DIGIT)) handleDigit(Number(e.key));
      else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") handleDigit(0);
    },
    [handleDigit, terminal],
  );

  if (state.phase === "done") {
    return (
      <div className="killer-sudoku">
        <div className="killer-sudoku-game-over">
          Done! {state.totalSolved} / {state.puzzles.length} solved — {state.score} pts
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errorSet = new Set(state.errors);
  const highlightSet = new Set<number>();
  if (state.selected !== null) {
    const r = Math.floor(state.selected / GRID_SIZE);
    const c = state.selected % GRID_SIZE;
    for (let i = 0; i < GRID_SIZE; i++) {
      highlightSet.add(r * GRID_SIZE + i);
      highlightSet.add(i * GRID_SIZE + c);
    }
    const br = Math.floor(r / BOX_ROWS) * BOX_ROWS;
    const bc = Math.floor(c / BOX_COLS) * BOX_COLS;
    for (let dr = 0; dr < BOX_ROWS; dr++)
      for (let dc = 0; dc < BOX_COLS; dc++)
        highlightSet.add((br + dr) * GRID_SIZE + (bc + dc));
  }

  return (
    <div className="killer-sudoku" tabIndex={0} onKeyDown={handleKey}>
      <div className="killer-sudoku-info">
        <span>Puzzle: {state.idx + 1} / {state.puzzles.length}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>

      {state.solved && (
        <div className="killer-sudoku-game-over">
          Solved! Score: {state.score} — press Next
        </div>
      )}

      <div className="killer-sudoku-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
          const row = Math.floor(idx / GRID_SIZE);
          const col = idx % GRID_SIZE;
          const val = state.current[idx] ?? 0;
          const given = puzzle.given[idx] !== 0;
          const isSelected = state.selected === idx;
          const isError = errorSet.has(idx);
          const isHighlight = highlightSet.has(idx) && !isSelected;

          let cls = "killer-sudoku-cell";
          if (given) cls += " given";
          if (isSelected) cls += " selected";
          else if (isError) cls += " error";
          else if (isHighlight) cls += " highlight";

          return (
            <div
              key={idx}
              className={cls}
              data-row={row}
              data-col={col}
              onClick={() => handleCell(idx)}
            >
              {val !== 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="killer-sudoku-numpad">
        {Array.from({ length: MAX_DIGIT }, (_, i) => i + 1).map((d) => (
          <button key={d} onClick={() => handleDigit(d)} disabled={!!terminal}>{d}</button>
        ))}
        <button className="erase" onClick={() => handleDigit(0)} disabled={!!terminal}>X</button>
      </div>

      <div className="killer-sudoku-btns">
        <button onClick={() => dispatch({ type: "check" } satisfies KillerSudokuAction)} disabled={!!terminal}>Check</button>
        <button onClick={() => dispatch({ type: "hint" } satisfies KillerSudokuAction)} disabled={!!terminal}>Hint</button>
        <button
          disabled={!state.solved}
          onClick={() => dispatch({ type: "next" } satisfies KillerSudokuAction)}
        >
          {state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
