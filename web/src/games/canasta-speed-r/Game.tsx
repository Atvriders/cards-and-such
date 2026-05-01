import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function CanastaSpeedRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cspdr-wrap"><div className="cspdr-done"><h2>Done!</h2><div className="cspdr-final">{state.score} pts</div></div></div>;
  return (
    <div className="cspdr-wrap">
      <div className="cspdr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cspdr-score">{state.score} pts</div>
      <div className="cspdr-row">{state.hand.map((c, i) => <div key={i} className={`cspdr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="cspdr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="cspdr-result">{state.result} — +{state.pts}</div>
        <button className="cspdr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
