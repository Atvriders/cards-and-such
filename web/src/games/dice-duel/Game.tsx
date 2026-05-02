import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDuelState, DiceDuelAction, DiceDuelSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DiceDuelGame({ state, dispatch, onGameOver }: GameProps<DiceDuelState, DiceDuelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Wins: {state.wins} / {TOTAL_ROUNDS}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts (Wins: {state.wins})</div>
      {state.you && state.cpu && <>
        <div>You: <span className="dm-row" style={{ display:"inline-flex" }}>{state.you.map((d,i) => <span key={i} className="dm-die small">{d}</span>)}</span> = {state.you.reduce((a,b)=>a+b,0)}</div>
        <div>CPU: <span className="dm-row" style={{ display:"inline-flex" }}>{state.cpu.map((d,i) => <span key={i} className="dm-die small">{d}</span>)}</span> = {state.cpu.reduce((a,b)=>a+b,0)}</div>
      </>}
      {state.phase === "ready" && <button data-testid="hint-target-dice-duel-roll" className="dm-btn" onClick={() => dispatch({ type:"duel" } as DiceDuelAction)}>Duel!</button>}
      {state.phase === "result" && <>
        <div className="dm-result">{state.outcome === "win" ? "WIN +10" : state.outcome === "lose" ? "Lose" : "Tie"}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceDuelAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
