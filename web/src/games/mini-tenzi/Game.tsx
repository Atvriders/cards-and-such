import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniTenziState, MiniTenziAction, MiniTenziSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, MAX_ROLLS } from "./state.js";
import "./Game.css";
export function MiniTenziGame({ state, dispatch, onGameOver }: GameProps<MiniTenziState, MiniTenziSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Target: {state.target} — Rolls: {state.rolls} / {MAX_ROLLS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row" style={{ flexWrap:"wrap", maxWidth:520 }}>{state.dice.map((d, i) => <button key={i} className="dm-die" style={{ background: state.held[i] ? "#27ae60" : "#fff", color: state.held[i] ? "#fff" : "#2c3e50", fontSize:"1.6rem", padding:"8px 12px", minWidth:50 }} disabled={state.phase !== "play"} onClick={() => dispatch({ type:"toggle", idx:i } as MiniTenziAction)}>{d}</button>)}</div>
      {state.phase === "play" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as MiniTenziAction)}>Roll unheld</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">Round score: +{state.ptsThisRound}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as MiniTenziAction)}>Next</button>
      </>}
    </div>
  );
}
