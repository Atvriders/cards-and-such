import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SudokuMini4x4State, SudokuMini4x4Action, SudokuMini4x4Settings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function SudokuMini4x4Game({ state, dispatch, onGameOver }: GameProps<SudokuMini4x4State, SudokuMini4x4Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as SudokuMini4x4Action);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as SudokuMini4x4Action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="sudoku4x4kid-wrap">
        <div className="sudoku4x4kid-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="sudoku4x4kid-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="sudoku4x4kid-wrap">
      <div className="sudoku4x4kid-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="sudoku4x4kid-score">{state.score} pts</span>
      </div>
      <div className="sudoku4x4kid-mech">4×4 Sudoku — fill so rows, columns, and 2×2 boxes contain digits 1–4.</div>
      <div className="sudoku4x4kid-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="sudoku4x4kid-row">
            {Array.from({ length: GRID_SIZE }, (_, c) => {
              const idx = r * GRID_SIZE + c;
              const v = state.current[idx]!;
              const isGiven = puzzle.given[idx] !== 0;
              const isSel = state.selected === idx;
              const isErr = errSet.has(idx);
              const rightThick = (c + 1) % BOX_COLS === 0 && c + 1 < GRID_SIZE;
              const bottomThick = (r + 1) % BOX_ROWS === 0 && r + 1 < GRID_SIZE;
              return (
                <button
                  key={c}
                  className={`sudoku4x4kid-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as SudokuMini4x4Action)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sudoku4x4kid-pad">
        {digits.map((d) => (
          <button key={d} className="sudoku4x4kid-num" onClick={() => dispatch({ type: "enter", digit: d } as SudokuMini4x4Action)}>{d}</button>
        ))}
        <button className="sudoku4x4kid-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as SudokuMini4x4Action)}>×</button>
      </div>
      <div className="sudoku4x4kid-actions">
        <button className="sudoku4x4kid-btn check" onClick={() => dispatch({ type: "check" } as SudokuMini4x4Action)}>Check</button>
        <button className="sudoku4x4kid-btn hint" onClick={() => dispatch({ type: "hint" } as SudokuMini4x4Action)}>Hint</button>
        <button className="sudoku4x4kid-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as SudokuMini4x4Action)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="sudoku4x4kid-status solved">Solved! Press Next.</div>}
    </div>
  );
}
