import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MexicanaCanastaRState, MexicanaCanastaRAction, MexicanaCanastaRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function MexicanaCanastaRGame({ state, dispatch, onGameOver }: GameProps<MexicanaCanastaRState, MexicanaCanastaRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mxnr-wrap"><div className="mxnr-done"><h2>Done!</h2><div className="mxnr-final">{state.score} pts</div></div></div>;
  return (
    <div className="mxnr-wrap">
      <div className="mxnr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mxnr-score">{state.score} pts</div>
      <div className="mxnr-row">{state.hand.map((c, i) => <div key={i} className={`mxnr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="mxnr-btn" onClick={() => dispatch({ type: "score" } as MexicanaCanastaRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="mxnr-result">{state.result} — +{state.pts}</div>
        <button className="mxnr-btn alt" onClick={() => dispatch({ type: "next" } as MexicanaCanastaRAction)}>Next</button>
      </>}
    </div>
  );
}
