import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RaminoRState, RaminoRAction, RaminoRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function RaminoRGame({ state, dispatch, onGameOver }: GameProps<RaminoRState, RaminoRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rmnr-wrap"><div className="rmnr-done"><h2>Done!</h2><div className="rmnr-final">{state.score} pts</div></div></div>;
  return (
    <div className="rmnr-wrap">
      <div className="rmnr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="rmnr-score">{state.score} pts</div>
      <div className="rmnr-row">{state.hand.map((c, i) => <div key={i} className={`rmnr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-ramino-r-play" className="rmnr-btn" onClick={() => dispatch({ type: "score" } as RaminoRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="rmnr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-ramino-r-next" className="rmnr-btn alt" onClick={() => dispatch({ type: "next" } as RaminoRAction)}>Next</button>
      </>}
    </div>
  );
}
