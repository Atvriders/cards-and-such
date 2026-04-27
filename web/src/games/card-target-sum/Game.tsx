import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTargetSumState, CardTargetSumAction, CardTargetSumSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, pipValue, isRed } from "./state.js";
import "./Game.css";
export function CardTargetSumGame({ state, dispatch, onGameOver }: GameProps<CardTargetSumState, CardTargetSumSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Target: {state.target}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">{state.pool.map((c, i) => {
        const sel = state.selected.includes(i);
        return <button key={i} className={`dm-card ${isRed(c) ? "red" : "black"}${sel ? " selected" : ""}`} disabled={state.phase !== "play"} style={{ outline: sel ? "3px solid #3498db" : "none" }} onClick={() => dispatch({ type:"toggle", idx:i } as CardTargetSumAction)}>{cardName(c)}<br/><small>{pipValue(c)}</small></button>;
      })}</div>
      {state.phase === "play" && <button className="dm-btn" disabled={state.selected.length !== 3} onClick={() => dispatch({ type:"submit" } as CardTargetSumAction)}>Submit ({state.selected.length}/3)</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">Sum {state.sum} (target {state.target}) — +{state.pts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as CardTargetSumAction)}>Next</button>
      </>}
    </div>
  );
}
