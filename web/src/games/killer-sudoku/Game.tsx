import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KillerSudokuState, KillerSudokuAction, KillerSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function KillerSudokuGame({ state, dispatch, onGameOver }: GameProps<KillerSudokuState, KillerSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as KillerSudokuAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as KillerSudokuAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="killercrimescene-wrap">
        <div className="killercrimescene-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="killercrimescene-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="killercrimescene-wrap">
      <div className="killercrimescene-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="killercrimescene-score">{state.score} pts</span>
      </div>
      <div className="killercrimescene-mech">Sudoku with cage sums.</div>
      <div className="killercrimescene-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="killercrimescene-row">
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
                  className={`killercrimescene-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as KillerSudokuAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="killercrimescene-pad">
        {digits.map((d) => (
          <button key={d} className="killercrimescene-num" onClick={() => dispatch({ type: "enter", digit: d } as KillerSudokuAction)}>{d}</button>
        ))}
        <button className="killercrimescene-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as KillerSudokuAction)}>×</button>
      </div>
      <div className="killercrimescene-actions">
        <button className="killercrimescene-btn check" onClick={() => dispatch({ type: "check" } as KillerSudokuAction)}>Check</button>
        <button className="killercrimescene-btn hint" onClick={() => dispatch({ type: "hint" } as KillerSudokuAction)}>Hint</button>
        <button className="killercrimescene-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as KillerSudokuAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="killercrimescene-status solved">Solved! Press Next.</div>}
    </div>
  );
}
