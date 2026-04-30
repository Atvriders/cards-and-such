import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlidePuzzle3x3State, SlidePuzzle3x3Action, SlidePuzzle3x3Settings } from "./state.js";
import { isTerminal, neighborsOf, SIZE } from "./state.js";
import "./Game.css";

export function SlidePuzzle3x3Game({ state, dispatch, onGameOver }: GameProps<SlidePuzzle3x3State, SlidePuzzle3x3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const blank = state.tiles.indexOf(0);
  const movable = new Set(neighborsOf(blank));

  if (state.phase === "done") {
    return (
      <div className="sp3-wrap">
        <div className="sp3-banner">
          <h2 className="sp3-title">Solved!</h2>
          <div className="sp3-stat">Moves: <b>{state.moves}</b></div>
          <div className="sp3-final">{t?.score} pts</div>
          <button className="sp3-btn primary" onClick={() => dispatch({ type: "reset" } as SlidePuzzle3x3Action)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sp3-wrap">
      <div className="sp3-info">Click a tile next to the blank to slide it. Aim for 1–8 in order.</div>
      <div className="sp3-bar">
        <div className="sp3-stat">Moves: <b>{state.moves}</b></div>
        <button className="sp3-btn small" onClick={() => dispatch({ type: "reset" } as SlidePuzzle3x3Action)}>
          Shuffle
        </button>
      </div>
      <div className="sp3-grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 88px)`, gridTemplateRows: `repeat(${SIZE}, 88px)` }}>
        {state.tiles.map((v, i) => {
          if (v === 0) return <div key={i} className="sp3-blank" />;
          const can = movable.has(i);
          return (
            <button
              key={`${v}`}
              className={`sp3-tile${can ? " ready" : ""}`}
              onClick={() => dispatch({ type: "slide", index: i } as SlidePuzzle3x3Action)}
              disabled={!can}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}
