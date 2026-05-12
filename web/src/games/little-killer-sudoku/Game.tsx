import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LittleKillerSudokuState, LittleKillerSudokuAction, LittleKillerSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function LittleKillerSudokuGame({ state, dispatch, onGameOver }: GameProps<LittleKillerSudokuState, LittleKillerSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as LittleKillerSudokuAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as LittleKillerSudokuAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="littlekillerforensic-wrap">
        <div className="littlekillerforensic-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="littlekillerforensic-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="littlekillerforensic-wrap">
      <div className="littlekillerforensic-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="littlekillerforensic-score">{state.score} pts</span>
      </div>
      <div className="littlekillerforensic-mech">Sudoku with little-killer diagonal sum hints.</div>
      <div className="littlekillerforensic-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="littlekillerforensic-row">
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
                  className={`littlekillerforensic-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as LittleKillerSudokuAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="littlekillerforensic-pad">
        {digits.map((d) => (
          <button key={d} className="littlekillerforensic-num" onClick={() => dispatch({ type: "enter", digit: d } as LittleKillerSudokuAction)}>{d}</button>
        ))}
        <button title="Clear cell" className="littlekillerforensic-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as LittleKillerSudokuAction)}>×</button>
      </div>
      <div className="littlekillerforensic-actions">
        <button className="littlekillerforensic-btn check" onClick={() => dispatch({ type: "check" } as LittleKillerSudokuAction)}>Check</button>
        <button className="littlekillerforensic-btn hint" onClick={() => dispatch({ type: "hint" } as LittleKillerSudokuAction)}>Hint</button>
        <button className="littlekillerforensic-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as LittleKillerSudokuAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="littlekillerforensic-status solved">Solved! Press Next.</div>}
    </div>
  );
}
