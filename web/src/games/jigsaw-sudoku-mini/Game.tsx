import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JigsawSudokuMiniState, JigsawSudokuMiniAction, JigsawSudokuMiniSettings } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_DIGIT, BOX_ROWS, BOX_COLS } from "./state.js";
import "./Game.css";

export function JigsawSudokuMiniGame({ state, dispatch, onGameOver }: GameProps<JigsawSudokuMiniState, JigsawSudokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.selected === null) return;
      const d = parseInt(e.key, 10);
      if (!isNaN(d) && d >= 1 && d <= MAX_DIGIT) dispatch({ type: "enter", digit: d } as JigsawSudokuMiniAction);
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") dispatch({ type: "enter", digit: 0 } as JigsawSudokuMiniAction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.selected, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="jigsawsudokumini-wrap">
        <div className="jigsawsudokumini-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="jigsawsudokumini-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);
  const digits = Array.from({ length: MAX_DIGIT }, (_, i) => i + 1);

  return (
    <div className="jigsawsudokumini-wrap">
      <div className="jigsawsudokumini-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="jigsawsudokumini-score">{state.score} pts</span>
      </div>
      <div className="jigsawsudokumini-mech">Sudoku where boxes are irregular jigsaw shapes.</div>
      <div className="jigsawsudokumini-grid">
        {Array.from({ length: GRID_SIZE }, (_, r) => (
          <div key={r} className="jigsawsudokumini-row">
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
                  className={`jigsawsudokumini-cell${isGiven ? " given" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""}${rightThick ? " rt" : ""}${bottomThick ? " bt" : ""}`}
                  onClick={() => dispatch({ type: "select", index: idx } as JigsawSudokuMiniAction)}
                >{v === 0 ? "" : v}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="jigsawsudokumini-pad">
        {digits.map((d) => (
          <button key={d} className="jigsawsudokumini-num" onClick={() => dispatch({ type: "enter", digit: d } as JigsawSudokuMiniAction)}>{d}</button>
        ))}
        <button className="jigsawsudokumini-num clear" onClick={() => dispatch({ type: "enter", digit: 0 } as JigsawSudokuMiniAction)}>×</button>
      </div>
      <div className="jigsawsudokumini-actions">
        <button className="jigsawsudokumini-btn check" onClick={() => dispatch({ type: "check" } as JigsawSudokuMiniAction)}>Check</button>
        <button className="jigsawsudokumini-btn hint" onClick={() => dispatch({ type: "hint" } as JigsawSudokuMiniAction)}>Hint</button>
        <button className="jigsawsudokumini-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as JigsawSudokuMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="jigsawsudokumini-status solved">Solved! Press Next.</div>}
    </div>
  );
}
