import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EightPuzzleState, EightPuzzleAction, EightPuzzleSettings } from "./state.js";
import { isTerminal, neighborsOf, SIZE, SOLVED } from "./state.js";
import "./Game.css";

export function EightPuzzleGame({ state, dispatch, onGameOver }: GameProps<EightPuzzleState, EightPuzzleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const blank = state.tiles.indexOf(0);
  const movable = new Set(neighborsOf(blank));

  if (state.phase === "done") {
    return (
      <div className="ep-wrap">
        <div className="ep-banner">
          <h2 className="ep-title">Solved!</h2>
          <div className="ep-stat">Moves: <b>{state.moves}</b></div>
          <div className="ep-final">{t?.score} pts</div>
          <button className="ep-btn primary" onClick={() => dispatch({ type: "reset" } as EightPuzzleAction)}>
            Shuffle Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-wrap">
      <div className="ep-info">Slide tiles into the blank. Goal: 1–8 with the blank bottom-right.</div>
      <div className="ep-bar">
        <div className="ep-stat">Moves: <b>{state.moves}</b></div>
        <button className="ep-btn small" onClick={() => dispatch({ type: "reset" } as EightPuzzleAction)}>Shuffle</button>
      </div>
      <div className="ep-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 92px)`, gridTemplateRows: `repeat(${SIZE}, 92px)` }}>
        {state.tiles.map((v, i) => {
          if (v === 0) return <div key={`b-${i}`} className="ep-blank" />;
          const can = movable.has(i);
          const home = SOLVED[i] === v;
          const cls = ["ep-tile"];
          if (can) cls.push("ready");
          if (home) cls.push("home");
          return (
            <button
              key={`t-${v}`}
              className={cls.join(" ")}
              disabled={!can}
              onClick={() => dispatch({ type: "slide", index: i } as EightPuzzleAction)}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
