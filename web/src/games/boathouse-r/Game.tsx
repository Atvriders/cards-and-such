import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoathouseRState, BoathouseRAction, BoathouseRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function BoathouseRGame({ state, dispatch, onGameOver }: GameProps<BoathouseRState, BoathouseRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="bhsr-wrap"><div className="bhsr-done"><h2>Done!</h2><div className="bhsr-final">{state.score} pts</div></div></div>;
  return (
    <div className="bhsr-wrap">
      <div className="bhsr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bhsr-score">{state.score} pts</div>
      <div className="bhsr-row">{state.hand.map((c, i) => <div key={i} className={`bhsr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-boathouse-r-play" className="bhsr-btn" onClick={() => dispatch({ type: "score" } as BoathouseRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="bhsr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-boathouse-r-next" className="bhsr-btn alt" onClick={() => dispatch({ type: "next" } as BoathouseRAction)}>Next</button>
      </>}
    </div>
  );
}
