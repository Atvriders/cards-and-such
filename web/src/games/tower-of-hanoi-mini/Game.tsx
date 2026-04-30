import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerOfHanoiMiniState, TowerOfHanoiMiniAction, TowerOfHanoiMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DISC_COLOURS = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
];

export function TowerOfHanoiMiniGame({ state, dispatch, onGameOver }: GameProps<TowerOfHanoiMiniState, TowerOfHanoiMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const optimal = (1 << state.discs) - 1;

  if (state.phase === "done") {
    return (
      <div className="toh-wrap">
        <div className="toh-banner">
          <h2 className="toh-title">Tower Built!</h2>
          <div className="toh-stat">Moves: <b>{state.moves}</b> · Optimal: <b>{optimal}</b></div>
          <div className="toh-final">{t?.score} pts</div>
          <button className="toh-btn primary" onClick={() => dispatch({ type: "reset" } as TowerOfHanoiMiniAction)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="toh-wrap">
      <div className="toh-info">
        Move the entire stack from the left peg to the right peg. Smaller discs only on bigger ones.
      </div>
      <div className="toh-bar">
        <div className="toh-stat">Moves: <b>{state.moves}</b></div>
        <div className="toh-stat">Optimal: <b>{optimal}</b></div>
        <button className="toh-btn small" onClick={() => dispatch({ type: "reset" } as TowerOfHanoiMiniAction)}>Reset</button>
      </div>
      <div className="toh-board">
        {state.pegs.map((peg, i) => (
          <button
            key={i}
            type="button"
            className={`toh-peg${state.selected === i ? " sel" : ""}`}
            onClick={() => dispatch({ type: "tap", peg: i } as TowerOfHanoiMiniAction)}
          >
            <div className="toh-rod" />
            <div className="toh-base" />
            <div className="toh-discs">
              {peg.map((d, j) => (
                <div
                  key={`${d}-${j}`}
                  className="toh-disc"
                  style={{
                    width: `${30 + d * 22}px`,
                    background: `linear-gradient(180deg, ${DISC_COLOURS[d - 1] ?? "#3b82f6"} 0%, color-mix(in srgb, ${DISC_COLOURS[d - 1] ?? "#3b82f6"} 60%, #000) 100%)`,
                  }}
                >
                  <span>{d}</span>
                </div>
              ))}
            </div>
            <div className="toh-label">{["A", "B", "C"][i]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
