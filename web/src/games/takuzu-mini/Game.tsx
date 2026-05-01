import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TakuzuMiniState, TakuzuMiniAction, TakuzuMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function TakuzuMiniGame({ state, dispatch, onGameOver }: GameProps<TakuzuMiniState, TakuzuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="takuzumini-wrap">
        <div className="takuzumini-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="takuzumini-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="takuzumini-wrap">
      <div className="takuzumini-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="takuzumini-score">{state.score} pts</span>
      </div>
      <div className="takuzumini-mech">Same rules as Binairo: equal counts, no 3-in-a-row of same symbol.</div>
      <div className="takuzumini-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="takuzumini-row">
            {Array.from({ length: GRID_COLS }, (_, c) => {
              const idx = r * GRID_COLS + c;
              const v = state.current[idx]!;
              const g = puzzle.given[idx]!;
              const isGiven = g !== 0 && g !== -1;
              const isBlocked = g === -1;
              const isSel = state.selected === idx;
              const isErr = errSet.has(idx);
              const valIdx = VALUES.indexOf(v);
              const label = isBlocked ? "■" : (v === 0 ? "" : (valIdx >= 0 ? VALUE_LABELS[valIdx] : String(v)));
              return (
                <button
                  key={c}
                  disabled={isBlocked}
                  className={`takuzumini-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as TakuzuMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="takuzumini-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`takuzumini-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as TakuzuMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="takuzumini-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as TakuzuMiniAction)}>×</button>
      </div>
      <div className="takuzumini-actions">
        <button className="takuzumini-btn check" onClick={() => dispatch({ type: "check" } as TakuzuMiniAction)}>Check</button>
        <button className="takuzumini-btn hint" onClick={() => dispatch({ type: "hint" } as TakuzuMiniAction)}>Hint</button>
        <button className="takuzumini-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as TakuzuMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="takuzumini-status solved">Solved! Press Next.</div>}
    </div>
  );
}
