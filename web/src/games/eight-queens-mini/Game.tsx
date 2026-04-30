import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EightQueensMiniState, EightQueensMiniAction, EightQueensMiniSettings } from "./state.js";
import { isTerminal, SIZE, PUZZLE_COUNT } from "./state.js";
import "./Game.css";

export function EightQueensMiniGame({ state, dispatch, onGameOver }: GameProps<EightQueensMiniState, EightQueensMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const placed = state.queens.filter(Boolean).length;

  if (state.phase === "done") {
    return (
      <div className="eqm-wrap">
        <div className="eqm-banner">
          <h2 className="eqm-title">All Solved!</h2>
          <div className="eqm-final">{state.score} pts</div>
          <p className="eqm-sub">{PUZZLE_COUNT} {SIZE}×{SIZE} queens puzzles cleared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="eqm-wrap">
      <div className="eqm-info">
        Place {SIZE} non-attacking queens. Puzzle {state.puzzleIndex + 1} / {PUZZLE_COUNT}
      </div>
      <div className="eqm-stats">
        <div className="eqm-stat"><span>Score</span><b>{state.score}</b></div>
        <div className="eqm-stat"><span>Placed</span><b>{placed} / {SIZE}</b></div>
      </div>
      <div className="eqm-board">
        {state.queens.map((q, i) => {
          const r = Math.floor(i / SIZE),
            c = i % SIZE;
          const dark = (r + c) % 2 === 1;
          const cls = ["eqm-cell"];
          if (dark) cls.push("dark");
          if (q) cls.push("queen");
          if (state.conflicts[i] && !q) cls.push("attacked");
          return (
            <button
              key={i}
              className={cls.join(" ")}
              onClick={() => dispatch({ type: "toggle", idx: i } as EightQueensMiniAction)}
              aria-label={q ? "queen" : "empty"}
            >
              {q ? <span className="eqm-glyph">♛</span> : null}
            </button>
          );
        })}
      </div>
      {state.message && <div className="eqm-msg">{state.message}</div>}
      <div className="eqm-actions">
        <button className="eqm-btn primary" onClick={() => dispatch({ type: "submit" } as EightQueensMiniAction)}>
          Submit
        </button>
        <button className="eqm-btn secondary" onClick={() => dispatch({ type: "reset" } as EightQueensMiniAction)}>
          Reset Board
        </button>
      </div>
    </div>
  );
}
