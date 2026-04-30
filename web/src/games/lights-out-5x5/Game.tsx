import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightsOut5x5State, LightsOut5x5Action, LightsOut5x5Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LightsOut5x5Game({ state, dispatch, onGameOver }: GameProps<LightsOut5x5State, LightsOut5x5Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="lo5-wrap">
        <div className="lo5-banner">
          <h2 className="lo5-title">All Off!</h2>
          <div className="lo5-stat">Moves: <b>{state.moves}</b></div>
          <div className="lo5-final">{t?.score} pts</div>
          <button className="lo5-btn primary" onClick={() => dispatch({ type: "reset" } as LightsOut5x5Action)}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const onCount = state.cells.filter(Boolean).length;
  return (
    <div className="lo5-wrap">
      <div className="lo5-info">Tap to flip the cell and its orthogonal neighbours. Goal: every light off.</div>
      <div className="lo5-bar">
        <div className="lo5-stat">Moves: <b>{state.moves}</b></div>
        <div className="lo5-stat">Lit: <b>{onCount} / 25</b></div>
        <button className="lo5-btn small" onClick={() => dispatch({ type: "reset" } as LightsOut5x5Action)}>New Board</button>
      </div>
      <div className="lo5-grid" style={{ gridTemplateColumns: `repeat(${state.size}, 56px)`, gridTemplateRows: `repeat(${state.size}, 56px)` }}>
        {state.cells.map((on, i) => (
          <button
            key={i}
            className={`lo5-cell${on ? " on" : ""}`}
            onClick={() => dispatch({ type: "tap", index: i } as LightsOut5x5Action)}
            aria-label={on ? "on" : "off"}
          />
        ))}
      </div>
    </div>
  );
}
