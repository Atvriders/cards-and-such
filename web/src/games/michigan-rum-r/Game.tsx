import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MichiganRumRState, MichiganRumRAction, MichiganRumRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function MichiganRumRGame({ state, dispatch, onGameOver }: GameProps<MichiganRumRState, MichiganRumRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mchr-wrap"><div className="mchr-done"><h2>Done!</h2><div className="mchr-final">{state.score} pts</div></div></div>;
  return (
    <div className="mchr-wrap">
      <div className="mchr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mchr-score">{state.score} pts</div>
      <div className="mchr-row">{state.hand.map((c, i) => <div key={i} className={`mchr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="mchr-btn" onClick={() => dispatch({ type: "score" } as MichiganRumRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="mchr-result">{state.result} — +{state.pts}</div>
        <button className="mchr-btn alt" onClick={() => dispatch({ type: "next" } as MichiganRumRAction)}>Next</button>
      </>}
    </div>
  );
}
