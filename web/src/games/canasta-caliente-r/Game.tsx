import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function CanastaCalienteRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ccalr-wrap"><div className="ccalr-done"><h2>Done!</h2><div className="ccalr-final">{state.score} pts</div></div></div>;
  return (
    <div className="ccalr-wrap">
      <div className="ccalr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ccalr-score">{state.score} pts</div>
      <div className="ccalr-row">{state.hand.map((c, i) => <div key={i} className={`ccalr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="ccalr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="ccalr-result">{state.result} — +{state.pts}</div>
        <button className="ccalr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
