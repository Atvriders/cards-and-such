import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArrowSudokuState, ArrowSudokuSettings, ArrowSudokuAction } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./ArrowSudoku.css";

export function ArrowSudoku({ state, dispatch, onGameOver }: GameProps<ArrowSudokuState, ArrowSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) {
        dispatch({ type: "enter", digit: d } satisfies ArrowSudokuAction);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "enter", digit: 0 } satisfies ArrowSudokuAction);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="arrow-sudoku">
        <div className="arrow-sudoku-title">Arrow Sudoku</div>
        <div className="arrow-sudoku-status win">
          Done! {state.totalSolved} / {state.puzzles.length} solved — {state.score} pts
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="arrow-sudoku">
      <div className="arrow-sudoku-title">Arrow Sudoku</div>
      <div className={`arrow-sudoku-status${state.solved ? " win" : ""}`}>
        {state.solved
          ? `Solved! Score: ${state.score} — press Next`
          : `Puzzle ${state.idx + 1} / ${state.puzzles.length} — Moves: ${state.movesMade} — Score: ${state.score}`}
      </div>

      <div className="arrow-sudoku-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
          const r = Math.floor(idx / GRID_SIZE);
          const c = idx % GRID_SIZE;
          const val = state.current[idx] ?? 0;
          const given = puzzle.given[idx] !== 0;
          const isSelected = state.selected === idx;
          const isError = errSet.has(idx);
          const rightThick = (c + 1) % BOX_COLS === 0 && c + 1 < GRID_SIZE;
          const bottomThick = (r + 1) % BOX_ROWS === 0 && r + 1 < GRID_SIZE;

          const classes = [
            "as-cell",
            given ? "given" : "",
            isSelected ? "selected" : "",
            isError ? "conflict" : "",
            state.solved ? "won-cell" : "",
            rightThick ? "rt" : "",
            bottomThick ? "bt" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={idx}
              className={classes}
              onClick={() => !state.solved && dispatch({ type: "select", index: idx } satisfies ArrowSudokuAction)}
            >
              {val !== 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="arrow-sudoku-numpad">
        {digits.map(d => (
          <button
            key={d}
            onClick={() => dispatch({ type: "enter", digit: d } satisfies ArrowSudokuAction)}
          >
            {d}
          </button>
        ))}
        <button
          aria-label="Clear"
          onClick={() => dispatch({ type: "enter", digit: 0 } satisfies ArrowSudokuAction)}
        >
          X
        </button>
      </div>

      <div className="arrow-sudoku-btns">
        <button onClick={() => dispatch({ type: "check" } satisfies ArrowSudokuAction)}>Check</button>
        <button onClick={() => dispatch({ type: "hint" } satisfies ArrowSudokuAction)}>Hint</button>
        <button
          disabled={!state.solved}
          onClick={() => dispatch({ type: "next" } satisfies ArrowSudokuAction)}
        >
          {state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
