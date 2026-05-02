import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedDogProgressiveCasState, RedDogProgressiveCasAction, RedDogProgressiveCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RedDogProgressiveCasGame({ state, dispatch, onGameOver }: GameProps<RedDogProgressiveCasState, RedDogProgressiveCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rdp-c-wrap"><div className="rdp-c-done"><h2>Done!</h2><div className="rdp-c-final">{state.score} pts</div></div></div>;
  return (
    <div className="rdp-c-wrap">
      <div className="rdp-c-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rdp-c-score">{state.score} pts</div>
      {state.left !== null && state.right !== null && <div className="rdp-c-row">
        <div className={`rdp-c-card ${isRed(state.left) ? "red" : "black"}`}>{cardName(state.left)}</div>
        {state.middle !== null && <div className={`rdp-c-card ${isRed(state.middle) ? "red" : "black"}`}>{cardName(state.middle)}</div>}
        <div className={`rdp-c-card ${isRed(state.right) ? "red" : "black"}`}>{cardName(state.right)}</div>
      </div>}
      {state.phase === "ready" && <button data-testid="hint-target-red-dog-progressive-cas-primary" className="rdp-c-btn" onClick={() => dispatch({ type: "play" } as RedDogProgressiveCasAction)}>Play</button>}
      {state.phase === "scored" && <>
        <div className="rdp-c-result">{state.result}</div>
        <button className="rdp-c-btn alt" onClick={() => dispatch({ type: "next" } as RedDogProgressiveCasAction)}>Next</button>
      </>}
    </div>
  );
}
