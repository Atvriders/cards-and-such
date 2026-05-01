import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TapaMiniState, TapaMiniAction, TapaMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function TapaMiniGame({ state, dispatch, onGameOver }: GameProps<TapaMiniState, TapaMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tapamini-wrap">
        <div className="tapamini-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="tapamini-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="tapamini-wrap">
      <div className="tapamini-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="tapamini-score">{state.score} pts</span>
      </div>
      <div className="tapamini-mech">Shade cells per clue patterns to form one connected wall.</div>
      <div className="tapamini-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="tapamini-row">
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
                  className={`tapamini-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as TapaMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="tapamini-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`tapamini-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as TapaMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="tapamini-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as TapaMiniAction)}>×</button>
      </div>
      <div className="tapamini-actions">
        <button className="tapamini-btn check" onClick={() => dispatch({ type: "check" } as TapaMiniAction)}>Check</button>
        <button className="tapamini-btn hint" onClick={() => dispatch({ type: "hint" } as TapaMiniAction)}>Hint</button>
        <button className="tapamini-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as TapaMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="tapamini-status solved">Solved! Press Next.</div>}
    </div>
  );
}
