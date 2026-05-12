import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagnetsPuzzleState, MagnetsPuzzleAction, MagnetsPuzzleSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function MagnetsPuzzleGame({ state, dispatch, onGameOver }: GameProps<MagnetsPuzzleState, MagnetsPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="magnetspoles-wrap">
        <div className="magnetspoles-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="magnetspoles-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="magnetspoles-wrap">
      <div className="magnetspoles-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="magnetspoles-score">{state.score} pts</span>
      </div>
      <div className="magnetspoles-mech">Place + and − magnets so likes never touch; some cells are neutral.</div>
      <div className="magnetspoles-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="magnetspoles-row">
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
                  className={`magnetspoles-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as MagnetsPuzzleAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="magnetspoles-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`magnetspoles-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as MagnetsPuzzleAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="magnetspoles-num clear" title="Clear cell" onClick={() => dispatch({ type: "enter", value: 0 } as MagnetsPuzzleAction)}>×</button>
      </div>
      <div className="magnetspoles-actions">
        <button className="magnetspoles-btn check" onClick={() => dispatch({ type: "check" } as MagnetsPuzzleAction)}>Check</button>
        <button className="magnetspoles-btn hint" onClick={() => dispatch({ type: "hint" } as MagnetsPuzzleAction)}>Hint</button>
        <button className="magnetspoles-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as MagnetsPuzzleAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="magnetspoles-status solved">Solved! Press Next.</div>}
    </div>
  );
}
