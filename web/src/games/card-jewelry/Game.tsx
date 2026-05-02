import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardJewelryState, CardJewelryAction, CardJewelrySettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function CardJewelryGame({ state, dispatch, onGameOver }: GameProps<CardJewelryState, CardJewelrySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">💎 Draw {state.drawCount} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && (
        <div className={`cm-card ${isRed(state.card) ? "red" : "black"}`}>{cardName(state.card)}</div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-jewelry-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardJewelryAction)}>Draw Card</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">+{state.lastPts} pts</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardJewelryAction)}>{state.drawCount >= TOTAL_DRAWS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
