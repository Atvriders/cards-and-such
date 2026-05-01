import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LiverpoolRState, LiverpoolRAction, LiverpoolRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function LiverpoolRGame({ state, dispatch, onGameOver }: GameProps<LiverpoolRState, LiverpoolRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="lvpr-wrap"><div className="lvpr-done"><h2>Done!</h2><div className="lvpr-final">{state.score} pts</div></div></div>;
  return (
    <div className="lvpr-wrap">
      <div className="lvpr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="lvpr-score">{state.score} pts</div>
      <div className="lvpr-row">{state.hand.map((c, i) => <div key={i} className={`lvpr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="lvpr-btn" onClick={() => dispatch({ type: "score" } as LiverpoolRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="lvpr-result">{state.result} — +{state.pts}</div>
        <button className="lvpr-btn alt" onClick={() => dispatch({ type: "next" } as LiverpoolRAction)}>Next</button>
      </>}
    </div>
  );
}
