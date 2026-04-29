import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PropellerState, PropellerAction, PropellerSettings } from "./state.js";
import { isTerminal, cardName, ROUNDS } from "./state.js";
import "./Game.css";

export function PropellerGame({ state, dispatch, onGameOver }: GameProps<PropellerState, PropellerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const rating = state.score >= 120 ? "Excellent" : state.score >= 80 ? "Good" : state.score >= 40 ? "Fair" : "Pass";
    return <div className="sol-wrap"><div className="sol-done"><h2>Done!</h2><div className="sol-final">{state.score} pts</div><div>{rating}</div></div></div>;
  }
  return (
    <div className="sol-wrap">
      <div className="sol-header">
        <span className="sol-info">Round: {state.round + 1} / {ROUNDS}</span>
        <span className="sol-score">{state.score} pts</span>
      </div>
      <div className="sol-board">
        {state.hand.map((c, i) => (
          <button key={i} className="sol-card" onClick={() => dispatch({ type: "swap", index: i } as PropellerAction)}>
            {cardName(c)}
          </button>
        ))}
      </div>
      <div className="sol-actions">
        <button className="sol-btn sol-btn-keep" onClick={() => dispatch({ type: "keep" } as PropellerAction)}>Keep & Score</button>
        <button className="sol-btn sol-btn-disc" onClick={() => dispatch({ type: "discard", index: 0 } as PropellerAction)}>Discard Hand</button>
      </div>
      <div className="sol-log">
        {state.log.slice(-3).map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}
