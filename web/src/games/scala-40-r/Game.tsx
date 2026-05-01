import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function Scala40RGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sc40br-wrap"><div className="sc40br-done"><h2>Done!</h2><div className="sc40br-final">{state.score} pts</div></div></div>;
  return (
    <div className="sc40br-wrap">
      <div className="sc40br-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="sc40br-score">{state.score} pts</div>
      <div className="sc40br-row">{state.hand.map((c, i) => <div key={i} className={`sc40br-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="sc40br-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="sc40br-result">{state.result} — +{state.pts}</div>
        <button className="sc40br-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
