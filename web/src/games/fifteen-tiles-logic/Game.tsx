import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleAction, FifteenPuzzleSettings } from "./state.js";
import { isTerminal, neighborsOf, SIZE, SOLVED } from "./state.js";
import "./Game.css";

export function FifteenPuzzleGame({ state, dispatch, onGameOver }: GameProps<FifteenPuzzleState, FifteenPuzzleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const blank = state.tiles.indexOf(0);
  const movable = new Set(neighborsOf(blank));

  if (state.phase === "done") {
    return (
      <div className="fp-wrap">
        <div className="fp-banner">
          <h2 className="fp-title">Solved!</h2>
          <div className="fp-stat">Moves: <b>{state.moves}</b></div>
          <div className="fp-final">{t?.score} pts</div>
          <button className="fp-btn primary" onClick={() => dispatch({ type: "reset" } as FifteenPuzzleAction)}>
            Shuffle Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-wrap">
      <div className="fp-info">Slide tiles into the blank. Goal: 1 to {SOLVED.length - 1} in order.</div>
      <div className="fp-bar">
        <div className="fp-stat">Moves: <b>{state.moves}</b></div>
        <button className="fp-btn small" onClick={() => dispatch({ type: "reset" } as FifteenPuzzleAction)}>Shuffle</button>
      </div>
      <div className="fp-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 64px)`, gridTemplateRows: `repeat(${SIZE}, 64px)` }}>
        {state.tiles.map((v, i) => {
          if (v === 0) return <div key={`b-${i}`} className="fp-blank" />;
          const can = movable.has(i);
          const correct = SOLVED[i] === v;
          const cls = ["fp-tile"];
          if (can) cls.push("ready");
          if (correct) cls.push("home");
          return (
            <button
              key={`t-${v}`}
              className={cls.join(" ")}
              disabled={!can}
              onClick={() => dispatch({ type: "slide", index: i } as FifteenPuzzleAction)}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
