import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Rummy500ClassicRState, Rummy500ClassicRAction, Rummy500ClassicRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function Rummy500ClassicRGame({ state, dispatch, onGameOver }: GameProps<Rummy500ClassicRState, Rummy500ClassicRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="r500r-wrap"><div className="r500r-done"><h2>Done!</h2><div className="r500r-final">{state.score} pts</div></div></div>;
  return (
    <div className="r500r-wrap">
      <div className="r500r-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="r500r-score">{state.score} pts</div>
      <div className="r500r-row">{state.hand.map((c, i) => <div key={i} className={`r500r-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="r500r-btn" onClick={() => dispatch({ type: "score" } as Rummy500ClassicRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="r500r-result">{state.result} — +{state.pts}</div>
        <button className="r500r-btn alt" onClick={() => dispatch({ type: "next" } as Rummy500ClassicRAction)}>Next</button>
      </>}
    </div>
  );
}
