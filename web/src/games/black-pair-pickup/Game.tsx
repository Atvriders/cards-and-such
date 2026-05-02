import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackPairPickupState, BlackPairPickupAction, BlackPairPickupSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BlackPairPickupGame({ state, dispatch, onGameOver }: GameProps<BlackPairPickupState, BlackPairPickupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-header">
        <span className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="cm-score">{state.score} pts</span>
      </div>
      <div className="cm-hand">
        {state.hand.map((c, i) => (
          <span key={i} className="cm-card" style={{ color: isRed(c) ? "#c0392b" : "#2c3e50" }}>{cardName(c)}</span>
        ))}
      </div>
      {state.phase === "dealing" && (
        <button data-testid="hint-target-black-pair-pickup-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as BlackPairPickupAction)}>Deal</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as BlackPairPickupAction)}>Next</button>
        </>
      )}
    </div>
  );
}
