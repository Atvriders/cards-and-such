import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoolRummyRState, PoolRummyRAction, PoolRummyRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function PoolRummyRGame({ state, dispatch, onGameOver }: GameProps<PoolRummyRState, PoolRummyRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="poolr-wrap"><div className="poolr-done"><h2>Done!</h2><div className="poolr-final">{state.score} pts</div></div></div>;
  return (
    <div className="poolr-wrap">
      <div className="poolr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="poolr-score">{state.score} pts</div>
      <div className="poolr-row">{state.hand.map((c, i) => <div key={i} className={`poolr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="poolr-btn" onClick={() => dispatch({ type: "score" } as PoolRummyRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="poolr-result">{state.result} — +{state.pts}</div>
        <button className="poolr-btn alt" onClick={() => dispatch({ type: "next" } as PoolRummyRAction)}>Next</button>
      </>}
    </div>
  );
}
