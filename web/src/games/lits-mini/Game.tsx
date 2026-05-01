import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LitsMiniState, LitsMiniAction, LitsMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function LitsMiniGame({ state, dispatch, onGameOver }: GameProps<LitsMiniState, LitsMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="litstetris-wrap">
        <div className="litstetris-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="litstetris-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="litstetris-wrap">
      <div className="litstetris-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="litstetris-score">{state.score} pts</span>
      </div>
      <div className="litstetris-mech">Fill cells to form L/I/T/S tetrominos under LITS rules.</div>
      <div className="litstetris-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="litstetris-row">
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
                  className={`litstetris-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as LitsMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="litstetris-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`litstetris-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as LitsMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="litstetris-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as LitsMiniAction)}>×</button>
      </div>
      <div className="litstetris-actions">
        <button className="litstetris-btn check" onClick={() => dispatch({ type: "check" } as LitsMiniAction)}>Check</button>
        <button className="litstetris-btn hint" onClick={() => dispatch({ type: "hint" } as LitsMiniAction)}>Hint</button>
        <button className="litstetris-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as LitsMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="litstetris-status solved">Solved! Press Next.</div>}
    </div>
  );
}
