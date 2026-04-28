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
        <div className="lo5-done">
          <h2>All Off!</h2>
          <div>Moves: {state.moves}</div>
          <div className="lo5-final">{t?.score} pts</div>
          <button className="lo5-btn" onClick={() => dispatch({ type: "reset" } as LightsOut5x5Action)}>Play Again</button>
        </div>
      </div>
    );
  }
  return (
    <div className="lo5-wrap">
      <div className="lo5-header">Moves: {state.moves}</div>
      <div className="lo5-grid" style={{ gridTemplateColumns: `repeat(${state.size},48px)`, gridTemplateRows: `repeat(${state.size},48px)` }}>
        {state.cells.map((on, i) => (
          <button key={i} className={`lo5-cell${on ? " on" : ""}`} onClick={() => dispatch({ type: "tap", index: i } as LightsOut5x5Action)} aria-label={on ? "on" : "off"} />
        ))}
      </div>
    </div>
  );
}
