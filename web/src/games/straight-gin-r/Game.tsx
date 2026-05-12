import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StraightGinRState, StraightGinRAction, StraightGinRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function StraightGinRGame({ state, dispatch, onGameOver }: GameProps<StraightGinRState, StraightGinRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="stgr-wrap"><div className="stgr-done bounce-in"><h2>Done!</h2><div className="stgr-final">{state.score} pts</div></div></div>;
  return (
    <div className="stgr-wrap fade-in">
      <div className="stgr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="stgr-score pulse">{state.score} pts</div>
      <div className="stgr-row">{state.hand.map((c, i) => <div key={i} className={`stgr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button data-testid="hint-target-straight-gin-r-play" className="stgr-btn" onClick={() => dispatch({ type: "score" } as StraightGinRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="stgr-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-straight-gin-r-next" className="stgr-btn alt" onClick={() => dispatch({ type: "next" } as StraightGinRAction)}>Next</button>
      </>}
    </div>
  );
}
