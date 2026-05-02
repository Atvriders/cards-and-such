import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConsecutivePairsSudokuState, ConsecutivePairsSudokuAction, ConsecutivePairsSudokuSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function ConsecutivePairsSudokuGame({ state, dispatch, onGameOver }: GameProps<ConsecutivePairsSudokuState, ConsecutivePairsSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as ConsecutivePairsSudokuAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as ConsecutivePairsSudokuAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="consecutivepairscopper-wrap">
        <div className="consecutivepairscopper-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="consecutivepairscopper-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="consecutivepairscopper-wrap">
      <div className="consecutivepairscopper-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="consecutivepairscopper-score">{state.score} pts</span>
      </div>
      <div className="consecutivepairscopper-mech">Sudoku where marked neighbors must be consecutive.</div>
      <div className="consecutivepairscopper-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="consecutivepairscopper-row">
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
                  className={`consecutivepairscopper-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as ConsecutivePairsSudokuAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="consecutivepairscopper-pad">
        {digits.map((d) => (
          <button key={d} className="consecutivepairscopper-num" onClick={() => dispatch({ type: "enter", digit: d } as ConsecutivePairsSudokuAction)}>{d}</button>
        ))}
        <button className="consecutivepairscopper-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as ConsecutivePairsSudokuAction)} aria-label="Clear" data-tooltip="Clear input">×</button>
      </div>
      <div className="consecutivepairscopper-actions">
        <button className="consecutivepairscopper-btn check" onClick={() => dispatch({ type: "check" } as ConsecutivePairsSudokuAction)}>Check</button>
        <button className="consecutivepairscopper-btn hint" onClick={() => dispatch({ type: "hint" } as ConsecutivePairsSudokuAction)}>Hint</button>
        <button className="consecutivepairscopper-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as ConsecutivePairsSudokuAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="consecutivepairscopper-status solved">Solved! Press Next.</div>}
    </div>
  );
}
