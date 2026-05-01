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
      <div className="magnetspuzzle-wrap">
        <div className="magnetspuzzle-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="magnetspuzzle-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="magnetspuzzle-wrap">
      <div className="magnetspuzzle-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="magnetspuzzle-score">{state.score} pts</span>
      </div>
      <div className="magnetspuzzle-mech">Place + and − magnets so likes never touch; some cells are neutral.</div>
      <div className="magnetspuzzle-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="magnetspuzzle-row">
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
                  className={`magnetspuzzle-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as MagnetsPuzzleAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="magnetspuzzle-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`magnetspuzzle-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as MagnetsPuzzleAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="magnetspuzzle-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as MagnetsPuzzleAction)}>×</button>
      </div>
      <div className="magnetspuzzle-actions">
        <button className="magnetspuzzle-btn check" onClick={() => dispatch({ type: "check" } as MagnetsPuzzleAction)}>Check</button>
        <button className="magnetspuzzle-btn hint" onClick={() => dispatch({ type: "hint" } as MagnetsPuzzleAction)}>Hint</button>
        <button className="magnetspuzzle-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as MagnetsPuzzleAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="magnetspuzzle-status solved">Solved! Press Next.</div>}
    </div>
  );
}
