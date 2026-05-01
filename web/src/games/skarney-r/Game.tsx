import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function SkarneyRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="skrr-wrap"><div className="skrr-done"><h2>Done!</h2><div className="skrr-final">{state.score} pts</div></div></div>;
  return (
    <div className="skrr-wrap">
      <div className="skrr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="skrr-score">{state.score} pts</div>
      <div className="skrr-row">{state.hand.map((c, i) => <div key={i} className={`skrr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="skrr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="skrr-result">{state.result} — +{state.pts}</div>
        <button className="skrr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
