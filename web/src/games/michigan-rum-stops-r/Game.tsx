import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function MichiganRumStopsRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mchsr-wrap"><div className="mchsr-done"><h2>Done!</h2><div className="mchsr-final">{state.score} pts</div></div></div>;
  return (
    <div className="mchsr-wrap">
      <div className="mchsr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mchsr-score">{state.score} pts</div>
      <div className="mchsr-row">{state.hand.map((c, i) => <div key={i} className={`mchsr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="mchsr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="mchsr-result">{state.result} — +{state.pts}</div>
        <button className="mchsr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
