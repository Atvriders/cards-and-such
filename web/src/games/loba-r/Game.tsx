import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LobaRState, LobaRAction, LobaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function LobaRGame({ state, dispatch, onGameOver }: GameProps<LobaRState, LobaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="lobr-wrap"><div className="lobr-done"><h2>Done!</h2><div className="lobr-final">{state.score} pts</div></div></div>;
  return (
    <div className="lobr-wrap">
      <div className="lobr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="lobr-score">{state.score} pts</div>
      <div className="lobr-row">{state.hand.map((c, i) => <div key={i} className={`lobr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="lobr-btn" onClick={() => dispatch({ type: "score" } as LobaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="lobr-result">{state.result} — +{state.pts}</div>
        <button className="lobr-btn alt" onClick={() => dispatch({ type: "next" } as LobaRAction)}>Next</button>
      </>}
    </div>
  );
}
