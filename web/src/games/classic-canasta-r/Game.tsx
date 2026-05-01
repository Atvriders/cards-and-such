import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState, GAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ClassicCanastaRGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="clcr-wrap"><div className="clcr-done"><h2>Done!</h2><div className="clcr-final">{state.score} pts</div></div></div>;
  return (
    <div className="clcr-wrap">
      <div className="clcr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="clcr-score">{state.score} pts</div>
      <div className="clcr-row">{state.hand.map((c, i) => <div key={i} className={`clcr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="clcr-btn" onClick={() => dispatch({ type: "score" } as GAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="clcr-result">{state.result} — +{state.pts}</div>
        <button className="clcr-btn alt" onClick={() => dispatch({ type: "next" } as GAction)}>Next</button>
      </>}
    </div>
  );
}
