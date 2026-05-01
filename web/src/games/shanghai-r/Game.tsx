import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShanghaiRState, ShanghaiRAction, ShanghaiRSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ShanghaiRGame({ state, dispatch, onGameOver }: GameProps<ShanghaiRState, ShanghaiRSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="shgr-wrap"><div className="shgr-done"><h2>Done!</h2><div className="shgr-final">{state.score} pts</div></div></div>;
  return (
    <div className="shgr-wrap">
      <div className="shgr-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="shgr-score">{state.score} pts</div>
      <div className="shgr-row">{state.hand.map((c, i) => <div key={i} className={`shgr-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="shgr-btn" onClick={() => dispatch({ type: "score" } as ShanghaiRAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="shgr-result">{state.result} — +{state.pts}</div>
        <button className="shgr-btn alt" onClick={() => dispatch({ type: "next" } as ShanghaiRAction)}>Next</button>
      </>}
    </div>
  );
}
