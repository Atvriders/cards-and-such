import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HashiMiniState, HashiMiniAction, HashiMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function HashiMiniGame({ state, dispatch, onGameOver }: GameProps<HashiMiniState, HashiMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="hashimini-wrap">
        <div className="hashimini-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="hashimini-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="hashimini-wrap">
      <div className="hashimini-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="hashimini-score">{state.score} pts</span>
      </div>
      <div className="hashimini-mech">Fill island degree counts; islands connect by 1-2 bridges to form one network.</div>
      <div className="hashimini-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="hashimini-row">
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
                  className={`hashimini-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as HashiMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="hashimini-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`hashimini-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as HashiMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="hashimini-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as HashiMiniAction)}>×</button>
      </div>
      <div className="hashimini-actions">
        <button className="hashimini-btn check" onClick={() => dispatch({ type: "check" } as HashiMiniAction)}>Check</button>
        <button className="hashimini-btn hint" onClick={() => dispatch({ type: "hint" } as HashiMiniAction)}>Hint</button>
        <button className="hashimini-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as HashiMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="hashimini-status solved">Solved! Press Next.</div>}
    </div>
  );
}
