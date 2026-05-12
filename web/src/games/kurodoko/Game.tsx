import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KurodokoState, KurodokoAction, KurodokoSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function KurodokoGame({ state, dispatch, onGameOver }: GameProps<KurodokoState, KurodokoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="kurodokomoonlight-wrap">
        <div className="kurodokomoonlight-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="kurodokomoonlight-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="kurodokomoonlight-wrap">
      <div className="kurodokomoonlight-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="kurodokomoonlight-score">{state.score} pts</span>
      </div>
      <div className="kurodokomoonlight-mech">Shade cells so numbered cells see exactly that many cells; shaded cells form one region.</div>
      <div className="kurodokomoonlight-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="kurodokomoonlight-row">
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
                  className={`kurodokomoonlight-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as KurodokoAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="kurodokomoonlight-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`kurodokomoonlight-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as KurodokoAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button title="Clear cell" className="kurodokomoonlight-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as KurodokoAction)}>×</button>
      </div>
      <div className="kurodokomoonlight-actions">
        <button className="kurodokomoonlight-btn check" onClick={() => dispatch({ type: "check" } as KurodokoAction)}>Check</button>
        <button className="kurodokomoonlight-btn hint" onClick={() => dispatch({ type: "hint" } as KurodokoAction)}>Hint</button>
        <button className="kurodokomoonlight-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as KurodokoAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="kurodokomoonlight-status solved">Solved! Press Next.</div>}
    </div>
  );
}
