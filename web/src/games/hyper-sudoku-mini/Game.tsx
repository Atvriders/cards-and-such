import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HyperSudokuMiniState, HyperSudokuMiniAction, HyperSudokuMiniSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function HyperSudokuMiniGame({ state, dispatch, onGameOver }: GameProps<HyperSudokuMiniState, HyperSudokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as HyperSudokuMiniAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as HyperSudokuMiniAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="hypersapphire-wrap">
        <div className="hypersapphire-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="hypersapphire-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="hypersapphire-wrap">
      <div className="hypersapphire-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="hypersapphire-score">{state.score} pts</span>
      </div>
      <div className="hypersapphire-mech">Sudoku with four extra 3×3 hyper-regions.</div>
      <div className="hypersapphire-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="hypersapphire-row">
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
                  className={`hypersapphire-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as HyperSudokuMiniAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="hypersapphire-pad">
        {digits.map((d) => (
          <button key={d} className="hypersapphire-num" onClick={() => dispatch({ type: "enter", digit: d } as HyperSudokuMiniAction)}>{d}</button>
        ))}
        <button className="hypersapphire-num clear" title="Clear cell" onClick={() => dispatch({ type: "enter", digit: 0 } as HyperSudokuMiniAction)}>×</button>
      </div>
      <div className="hypersapphire-actions">
        <button className="hypersapphire-btn check" onClick={() => dispatch({ type: "check" } as HyperSudokuMiniAction)}>Check</button>
        <button className="hypersapphire-btn hint" onClick={() => dispatch({ type: "hint" } as HyperSudokuMiniAction)}>Hint</button>
        <button className="hypersapphire-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as HyperSudokuMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="hypersapphire-status solved">Solved! Press Next.</div>}
    </div>
  );
}
