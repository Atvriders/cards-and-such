import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumbrixMiniState, NumbrixMiniAction, NumbrixMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function NumbrixMiniGame({ state, dispatch, onGameOver }: GameProps<NumbrixMiniState, NumbrixMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="numbrixchrome-wrap">
        <div className="numbrixchrome-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="numbrixchrome-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="numbrixchrome-wrap">
      <div className="numbrixchrome-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="numbrixchrome-score">{state.score} pts</span>
      </div>
      <div className="numbrixchrome-mech">Fill 1..16 in a connected horizontal/vertical chain.</div>
      <div className="numbrixchrome-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="numbrixchrome-row">
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
                  className={`numbrixchrome-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as NumbrixMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="numbrixchrome-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`numbrixchrome-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as NumbrixMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="numbrixchrome-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as NumbrixMiniAction)}>×</button>
      </div>
      <div className="numbrixchrome-actions">
        <button className="numbrixchrome-btn check" onClick={() => dispatch({ type: "check" } as NumbrixMiniAction)}>Check</button>
        <button className="numbrixchrome-btn hint" onClick={() => dispatch({ type: "hint" } as NumbrixMiniAction)}>Hint</button>
        <button className="numbrixchrome-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as NumbrixMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="numbrixchrome-status solved">Solved! Press Next.</div>}
    </div>
  );
}
