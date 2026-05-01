import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CountryRoadMiniState, CountryRoadMiniAction, CountryRoadMiniSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function CountryRoadMiniGame({ state, dispatch, onGameOver }: GameProps<CountryRoadMiniState, CountryRoadMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="countryroadmeadow-wrap">
        <div className="countryroadmeadow-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="countryroadmeadow-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="countryroadmeadow-wrap">
      <div className="countryroadmeadow-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="countryroadmeadow-score">{state.score} pts</span>
      </div>
      <div className="countryroadmeadow-mech">Draw a single closed loop visiting each region exactly once.</div>
      <div className="countryroadmeadow-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="countryroadmeadow-row">
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
                  className={`countryroadmeadow-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as CountryRoadMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="countryroadmeadow-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`countryroadmeadow-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as CountryRoadMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="countryroadmeadow-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as CountryRoadMiniAction)}>×</button>
      </div>
      <div className="countryroadmeadow-actions">
        <button className="countryroadmeadow-btn check" onClick={() => dispatch({ type: "check" } as CountryRoadMiniAction)}>Check</button>
        <button className="countryroadmeadow-btn hint" onClick={() => dispatch({ type: "hint" } as CountryRoadMiniAction)}>Hint</button>
        <button className="countryroadmeadow-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as CountryRoadMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="countryroadmeadow-status solved">Solved! Press Next.</div>}
    </div>
  );
}
