import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RenbanSudokuState, RenbanSudokuAction, RenbanSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function RenbanSudokuGame({ state, dispatch, onGameOver }: GameProps<RenbanSudokuState, RenbanSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as RenbanSudokuAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as RenbanSudokuAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="renbanribbon-wrap">
        <div className="renbanribbon-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="renbanribbon-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="renbanribbon-wrap">
      <div className="renbanribbon-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="renbanribbon-score">{state.score} pts</span>
      </div>
      <div className="renbanribbon-mech">Sudoku with renban lines (consecutive set, any order).</div>
      <div className="renbanribbon-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="renbanribbon-row">
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
                  className={`renbanribbon-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as RenbanSudokuAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="renbanribbon-pad">
        {digits.map((d) => (
          <button key={d} className="renbanribbon-num" onClick={() => dispatch({ type: "enter", digit: d } as RenbanSudokuAction)}>{d}</button>
        ))}
        <button className="renbanribbon-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as RenbanSudokuAction)}>×</button>
      </div>
      <div className="renbanribbon-actions">
        <button className="renbanribbon-btn check" onClick={() => dispatch({ type: "check" } as RenbanSudokuAction)}>Check</button>
        <button className="renbanribbon-btn hint" onClick={() => dispatch({ type: "hint" } as RenbanSudokuAction)}>Hint</button>
        <button className="renbanribbon-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as RenbanSudokuAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="renbanribbon-status solved">Solved! Press Next.</div>}
    </div>
  );
}
