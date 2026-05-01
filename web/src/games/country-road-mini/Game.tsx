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
      <div className="countryroadmini-wrap">
        <div className="countryroadmini-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="countryroadmini-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="countryroadmini-wrap">
      <div className="countryroadmini-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="countryroadmini-score">{state.score} pts</span>
      </div>
      <div className="countryroadmini-mech">Draw a single closed loop visiting each region exactly once.</div>
      <div className="countryroadmini-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="countryroadmini-row">
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
                  className={`countryroadmini-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as CountryRoadMiniAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="countryroadmini-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`countryroadmini-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as CountryRoadMiniAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="countryroadmini-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as CountryRoadMiniAction)}>×</button>
      </div>
      <div className="countryroadmini-actions">
        <button className="countryroadmini-btn check" onClick={() => dispatch({ type: "check" } as CountryRoadMiniAction)}>Check</button>
        <button className="countryroadmini-btn hint" onClick={() => dispatch({ type: "hint" } as CountryRoadMiniAction)}>Hint</button>
        <button className="countryroadmini-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as CountryRoadMiniAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="countryroadmini-status solved">Solved! Press Next.</div>}
    </div>
  );
}
