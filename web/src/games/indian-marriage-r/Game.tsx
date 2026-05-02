import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function IndianMarriageRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="imrr-wrap"><div className="imrr-done"><h2>Done!</h2><div className="imrr-final">{state.score} pts</div></div></div>;
  return (
    <div className="imrr-wrap">
      <div className="imrr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="imrr-score">{state.score} pts</div>
      <div className="imrr-row">{state.hand.map((c, i) => <div key={i} className={`imrr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-indian-marriage-r-play" className="imrr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="imrr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-indian-marriage-r-next" className="imrr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
