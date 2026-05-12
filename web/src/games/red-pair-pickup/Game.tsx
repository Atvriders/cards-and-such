import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedPairPickupState, RedPairPickupAction, RedPairPickupSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function RedPairPickupGame({ state, dispatch, onGameOver }: GameProps<RedPairPickupState, RedPairPickupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-header">
        <span className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="cm-score pulse">{state.score} pts</span>
      </div>
      <div className="cm-hand">
        {state.hand.map((c, i) => (
          <span key={i} className="cm-card" style={{ color: isRed(c) ? "#c0392b" : "#2c3e50" }}>{cardName(c)}</span>
        ))}
      </div>
      {state.phase === "dealing" && (
        <button data-testid="hint-target-red-pair-pickup-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as RedPairPickupAction)}>Deal</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as RedPairPickupAction)}>Next</button>
        </>
      )}
    </div>
  );
}
