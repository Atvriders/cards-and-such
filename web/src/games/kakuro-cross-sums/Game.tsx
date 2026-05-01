import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KakuroCrossSumsState, KakuroCrossSumsAction, KakuroCrossSumsSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function KakuroCrossSumsGame({ state, dispatch, onGameOver }: GameProps<KakuroCrossSumsState, KakuroCrossSumsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="kakurocross-wrap">
        <div className="kakurocross-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="kakurocross-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="kakurocross-wrap">
      <div className="kakurocross-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="kakurocross-score">{state.score} pts</span>
      </div>
      <div className="kakurocross-mech">Fill digits 1-9 so each entry sums to its clue. Stored-solution simplification.</div>
      <div className="kakurocross-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="kakurocross-row">
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
                  className={`kakurocross-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as KakuroCrossSumsAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="kakurocross-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`kakurocross-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as KakuroCrossSumsAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="kakurocross-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as KakuroCrossSumsAction)}>×</button>
      </div>
      <div className="kakurocross-actions">
        <button className="kakurocross-btn check" onClick={() => dispatch({ type: "check" } as KakuroCrossSumsAction)}>Check</button>
        <button className="kakurocross-btn hint" onClick={() => dispatch({ type: "hint" } as KakuroCrossSumsAction)}>Hint</button>
        <button className="kakurocross-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as KakuroCrossSumsAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="kakurocross-status solved">Solved! Press Next.</div>}
    </div>
  );
}
