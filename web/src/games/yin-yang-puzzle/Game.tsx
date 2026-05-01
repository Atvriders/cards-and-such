import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YinYangPuzzleState, YinYangPuzzleAction, YinYangPuzzleSettings } from "./state.js";
import { isTerminal, GRID_ROWS, GRID_COLS, VALUES, VALUE_LABELS } from "./state.js";
import "./Game.css";

export function YinYangPuzzleGame({ state, dispatch, onGameOver }: GameProps<YinYangPuzzleState, YinYangPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="yinyangpuzzle-wrap">
        <div className="yinyangpuzzle-done">
          <h2>Done!</h2>
          <p>Puzzles solved: {state.totalSolved} / {state.puzzles.length}</p>
          <p className="yinyangpuzzle-final">{state.score} pts</p>
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.idx]!;
  const errSet = new Set(state.errors);

  return (
    <div className="yinyangpuzzle-wrap">
      <div className="yinyangpuzzle-header">
        <span>Puzzle {state.idx + 1} / {state.puzzles.length}</span>
        <span className="yinyangpuzzle-score">{state.score} pts</span>
      </div>
      <div className="yinyangpuzzle-mech">Fill each cell black or white so each color forms a single connected region.</div>
      <div className="yinyangpuzzle-grid">
        {Array.from({ length: GRID_ROWS }, (_, r) => (
          <div key={r} className="yinyangpuzzle-row">
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
                  className={`yinyangpuzzle-cell${isGiven ? " given" : ""}${isBlocked ? " blocked" : ""}${isSel ? " sel" : ""}${isErr ? " err" : ""} val${valIdx}`}
                  onClick={() => !isBlocked && dispatch({ type: "select", index: idx } as YinYangPuzzleAction)}
                >{label}</button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="yinyangpuzzle-pad">
        {VALUES.map((vv, i) => (
          <button key={vv} className={`yinyangpuzzle-num val${i}`} onClick={() => dispatch({ type: "enter", value: vv } as YinYangPuzzleAction)}>{VALUE_LABELS[i]}</button>
        ))}
        <button className="yinyangpuzzle-num clear" onClick={() => dispatch({ type: "enter", value: 0 } as YinYangPuzzleAction)}>×</button>
      </div>
      <div className="yinyangpuzzle-actions">
        <button className="yinyangpuzzle-btn check" onClick={() => dispatch({ type: "check" } as YinYangPuzzleAction)}>Check</button>
        <button className="yinyangpuzzle-btn hint" onClick={() => dispatch({ type: "hint" } as YinYangPuzzleAction)}>Hint</button>
        <button className="yinyangpuzzle-btn next" disabled={!state.solved} onClick={() => dispatch({ type: "next" } as YinYangPuzzleAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>
      </div>
      {state.solved && <div className="yinyangpuzzle-status solved">Solved! Press Next.</div>}
    </div>
  );
}
