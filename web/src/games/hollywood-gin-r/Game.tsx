import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HollywoodGinRState, HollywoodGinRAction, HollywoodGinRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function HollywoodGinRGame({ state, dispatch, onGameOver }: GameProps<HollywoodGinRState, HollywoodGinRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="hwgr-wrap"><div className="hwgr-done"><h2>Done!</h2><div className="hwgr-final">{state.score} pts</div></div></div>;
  return (
    <div className="hwgr-wrap">
      <div className="hwgr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hwgr-score">{state.score} pts</div>
      <div className="hwgr-row">{state.hand.map((c, i) => <div key={i} className={`hwgr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-hollywood-gin-r-play" className="hwgr-btn" onClick={() => dispatch({ type: "score" } as HollywoodGinRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="hwgr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-hollywood-gin-r-next" className="hwgr-btn alt" onClick={() => dispatch({ type: "next" } as HollywoodGinRAction)}>Next</button>
      </>}
    </div>
  );
}
