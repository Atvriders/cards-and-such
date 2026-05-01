import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SudokuMini6x6State, SudokuMini6x6Action, SudokuMini6x6Settings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function SudokuMini6x6Game({ state, dispatch, onGameOver }: GameProps<SudokuMini6x6State, SudokuMini6x6Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as SudokuMini6x6Action);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as SudokuMini6x6Action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="sudoku6x6mint-wrap">
        <div className="sudoku6x6mint-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="sudoku6x6mint-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="sudoku6x6mint-wrap">
      <div className="sudoku6x6mint-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="sudoku6x6mint-score">{state.score} pts</span>
      </div>
      <div className="sudoku6x6mint-mech">6×6 Sudoku — fill so rows, columns, and 2×3 boxes contain digits 1–6.</div>
      <div className="sudoku6x6mint-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="sudoku6x6mint-row">
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
                  className={`sudoku6x6mint-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as SudokuMini6x6Action)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="sudoku6x6mint-pad">
        {digits.map((d) => (
          <button key={d} className="sudoku6x6mint-num" onClick={() => dispatch({ type: "enter", digit: d } as SudokuMini6x6Action)}>{d}</button>
        ))}
        <button className="sudoku6x6mint-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as SudokuMini6x6Action)}>×</button>
      </div>
      <div className="sudoku6x6mint-actions">
        <button className="sudoku6x6mint-btn check" onClick={() => dispatch({ type: "check" } as SudokuMini6x6Action)}>Check</button>
        <button className="sudoku6x6mint-btn hint" onClick={() => dispatch({ type: "hint" } as SudokuMini6x6Action)}>Hint</button>
        <button className="sudoku6x6mint-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as SudokuMini6x6Action)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="sudoku6x6mint-status solved">Solved! Press Next.</div>}
    </div>
  );
}
