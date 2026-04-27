import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardHoldEmState, CardHoldEmAction, CardHoldEmSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardHoldEmGame({ state, dispatch, onGameOver }: GameProps<CardHoldEmState, CardHoldEmSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="che-wrap"><div className="che-done"><h2>Done!</h2><div className="che-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="che-wrap">
      <div className="che-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="che-score">{state.score} pts</div>
      {state.hand && (
        <div className="che-row">
          <div className={`che-card ${isRed(state.hand[0]) ? "red" : "black"}`}>{cardName(state.hand[0])}</div>
          <div className={`che-card ${isRed(state.hand[1]) ? "red" : "black"}`}>{cardName(state.hand[1])}</div>
        </div>
      )}
      {state.phase === "predict" && (
        <>
          <div className="che-prompt">Bet on this hand:</div>
          <div className="che-row">
            <button className="che-btn" onClick={() => dispatch({ type: "predict", choice: "strong" } as CardHoldEmAction)}>STRONG</button>
            <button className="che-btn alt" onClick={() => dispatch({ type: "predict", choice: "weak" } as CardHoldEmAction)}>WEAK</button>
          </div>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className={`che-feedback ${state.lastWin ? "ok" : "no"}`}>{state.lastWin ? "Correct! +10" : `Wrong — hand was ${state.isStrong ? "STRONG" : "WEAK"}`}</div>
          <button className="che-btn alt" onClick={() => dispatch({ type: "next" } as CardHoldEmAction)}>Next</button>
        </>
      )}
    </div>
  );
}
