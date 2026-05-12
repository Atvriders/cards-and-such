import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { XSudokuMiniState, XSudokuMiniAction, XSudokuMiniSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function XSudokuMiniGame({ state, dispatch, onGameOver }: GameProps<XSudokuMiniState, XSudokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as XSudokuMiniAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as XSudokuMiniAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="xsudokucrimson-wrap">
        <div className="xsudokucrimson-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="xsudokucrimson-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="xsudokucrimson-wrap">
      <div className="xsudokucrimson-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="xsudokucrimson-score">{state.score} pts</span>
      </div>
      <div className="xsudokucrimson-mech">Sudoku with both diagonals also containing 1–9.</div>
      <div className="xsudokucrimson-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="xsudokucrimson-row">
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
                  className={`xsudokucrimson-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as XSudokuMiniAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="xsudokucrimson-pad">
        {digits.map((d) => (
          <button key={d} className="xsudokucrimson-num" onClick={() => dispatch({ type: "enter", digit: d } as XSudokuMiniAction)}>{d}</button>
        ))}
        <button className="xsudokucrimson-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as XSudokuMiniAction)} title="Clear cell">×</button>
      </div>
      <div className="xsudokucrimson-actions">
        <button className="xsudokucrimson-btn check" onClick={() => dispatch({ type: "check" } as XSudokuMiniAction)}>Check</button>
        <button className="xsudokucrimson-btn hint" onClick={() => dispatch({ type: "hint" } as XSudokuMiniAction)}>Hint</button>
        <button className="xsudokucrimson-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as XSudokuMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="xsudokucrimson-status solved">Solved! Press Next.</div>}
    </div>
  );
}
