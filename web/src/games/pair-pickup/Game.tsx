import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PairPickupState, PairPickupAction, PairPickupSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";

export function PairPickupGame({ state, dispatch, onGameOver }: GameProps<PairPickupState, PairPickupSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "dealing" && (
        <button data-testid="hint-target-pair-pickup-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as PairPickupAction)}>Deal 5</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.pairsFound > 0 ? `${state.pairsFound} pair${state.pairsFound !== 1 ? "s" : ""}: +${state.lastPts}` : "No pairs"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as PairPickupAction)}>{state.draw >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
