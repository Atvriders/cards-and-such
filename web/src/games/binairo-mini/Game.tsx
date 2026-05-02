import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BinairoMiniState, BinairoMiniAction, BinairoMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function BinairoMiniGame({ state, dispatch, onGameOver }: GameProps<BinairoMiniState, BinairoMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="binairobinary-wrap">
        <div className="binairobinary-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="binairobinary-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="binairobinary-wrap">
      <div className="binairobinary-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="binairobinary-score">{state.score} pts</span>
      </div>
      <div className="binairobinary-mech">Fill grid with circles and dots; equal counts per row/col, no 3-in-a-row.</div>
      <div className="binairobinary-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="binairobinary-row">
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
                  className={`binairobinary-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as BinairoMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="binairobinary-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`binairobinary-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as BinairoMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="binairobinary-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as BinairoMiniAction)} aria-label="Clear" data-tooltip="Clear input">×</button>
      </div>
      <div className="binairobinary-actions">
        <button className="binairobinary-btn check" onClick={() => dispatch({ type: "check" } as BinairoMiniAction)}>Check</button>
        <button className="binairobinary-btn hint" onClick={() => dispatch({ type: "hint" } as BinairoMiniAction)}>Hint</button>
        <button className="binairobinary-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as BinairoMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="binairobinary-status solved">Solved! Press Next.</div>}
    </div>
  );
}
