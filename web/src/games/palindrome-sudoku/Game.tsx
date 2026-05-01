import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PalindromeSudokuState, PalindromeSudokuAction, PalindromeSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function PalindromeSudokuGame({ state, dispatch, onGameOver }: GameProps<PalindromeSudokuState, PalindromeSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as PalindromeSudokuAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as PalindromeSudokuAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="palindromesudoku-wrap">
        <div className="palindromesudoku-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="palindromesudoku-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="palindromesudoku-wrap">
      <div className="palindromesudoku-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="palindromesudoku-score">{state.score} pts</span>
      </div>
      <div className="palindromesudoku-mech">Sudoku with palindrome lines that read the same forwards and backwards.</div>
      <div className="palindromesudoku-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="palindromesudoku-row">
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
                  className={`palindromesudoku-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as PalindromeSudokuAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="palindromesudoku-pad">
        {digits.map((d) => (
          <button key={d} className="palindromesudoku-num" onClick={() => dispatch({ type: "enter", digit: d } as PalindromeSudokuAction)}>{d}</button>
        ))}
        <button className="palindromesudoku-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as PalindromeSudokuAction)}>×</button>
      </div>
      <div className="palindromesudoku-actions">
        <button className="palindromesudoku-btn check" onClick={() => dispatch({ type: "check" } as PalindromeSudokuAction)}>Check</button>
        <button className="palindromesudoku-btn hint" onClick={() => dispatch({ type: "hint" } as PalindromeSudokuAction)}>Hint</button>
        <button className="palindromesudoku-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as PalindromeSudokuAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="palindromesudoku-status solved">Solved! Press Next.</div>}
    </div>
  );
}
