import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AkariMiniState, AkariMiniAction, AkariMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function AkariMiniGame({ state, dispatch, onGameOver }: GameProps<AkariMiniState, AkariMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="akariminiamber-wrap">
        <div className="akariminiamber-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="akariminiamber-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="akariminiamber-wrap">
      <div className="akariminiamber-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="akariminiamber-score">{state.score} pts</span>
      </div>
      <div className="akariminiamber-mech">Place light bulbs in white cells so all lit, no bulbs see each other.</div>
      <div className="akariminiamber-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="akariminiamber-row">
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
                  className={`akariminiamber-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as AkariMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="akariminiamber-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`akariminiamber-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as AkariMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="akariminiamber-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as AkariMiniAction)}>×</button>
      </div>
      <div className="akariminiamber-actions">
        <button className="akariminiamber-btn check" onClick={() => dispatch({ type: "check" } as AkariMiniAction)}>Check</button>
        <button className="akariminiamber-btn hint" onClick={() => dispatch({ type: "hint" } as AkariMiniAction)}>Hint</button>
        <button className="akariminiamber-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as AkariMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="akariminiamber-status solved">Solved! Press Next.</div>}
    </div>
  );
}
