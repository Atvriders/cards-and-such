import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniSpitState, MiniSpitAction, MiniSpitSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed, isPlayable } from "./state.js";
import "./Game.css";
export function MiniSpitGame({ state, dispatch, onGameOver }: GameProps<MiniSpitState, MiniSpitSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  const remaining = state.hand.filter(c => c !== null).length;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Cards left: {remaining}</div>
      <div className="dm-score">{state.score} pts</div>
      <div>Top:</div>
      <div className={`dm-card ${isRed(state.top) ? "red" : "black"}`} style={{ fontSize:"2rem" }}>{cardName(state.top)}</div>
      <div className="dm-row">{state.hand.map((c, i) => c === null ? <div key={i} style={{ width:60, opacity:0.3 }}>—</div>
        : <button key={i} disabled={state.phase !== "play" || !isPlayable(state.top, c)} className={`dm-card ${isRed(c) ? "red" : "black"}`} onClick={() => dispatch({ type:"play", idx:i } as MiniSpitAction)}>{cardName(c)}</button>)}</div>
      {state.phase === "play" && <button className="dm-btn alt" onClick={() => dispatch({ type:"end" } as MiniSpitAction)}>End round</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">Round score: +{state.ptsThisRound}</div>
        <button className="dm-btn" onClick={() => dispatch({ type:"next" } as MiniSpitAction)}>Next</button>
      </>}
    </div>
  );
}
