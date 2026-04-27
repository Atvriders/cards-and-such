import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCollectFlushState, CardCollectFlushAction, CardCollectFlushSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS, bestSuitCount } from "./state.js";
import "./Game.css";
export function CardCollectFlushGame({ state, dispatch, onGameOver }: GameProps<CardCollectFlushState, CardCollectFlushSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && <div className="cm-row">{state.hand.map((c,i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>}
      {state.phase === "playing" && <button className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardCollectFlushAction)}>Deal 5</button>}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Best suit: {bestSuitCount(state.hand)} of 5 — {state.lastPts > 0 ? `+${state.lastPts}` : "no points"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardCollectFlushAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
