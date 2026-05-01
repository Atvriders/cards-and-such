import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScalaFortyRState, ScalaFortyRAction, ScalaFortyRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ScalaFortyRGame({ state, dispatch, onGameOver }: GameProps<ScalaFortyRState, ScalaFortyRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sc40r-wrap"><div className="sc40r-done"><h2>Done!</h2><div className="sc40r-final">{state.score} pts</div></div></div>;
  return (
    <div className="sc40r-wrap">
      <div className="sc40r-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="sc40r-score">{state.score} pts</div>
      <div className="sc40r-row">{state.hand.map((c, i) => <div key={i} className={`sc40r-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="sc40r-btn" onClick={() => dispatch({ type: "score" } as ScalaFortyRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="sc40r-result">{state.result} — +{state.pts}</div>
        <button className="sc40r-btn alt" onClick={() => dispatch({ type: "next" } as ScalaFortyRAction)}>Next</button>
      </>}
    </div>
  );
}
