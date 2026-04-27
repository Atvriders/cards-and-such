import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShootoutState, DiceShootoutAction, DiceShootoutSettings } from "./state.js";
import { isTerminal, TARGET } from "./state.js";
import "./Game.css";
export function DiceShootoutGame({ state, dispatch, onGameOver }: GameProps<DiceShootoutState, DiceShootoutSettings>): JSX.Element {
  const t=isTerminal(state);
  useEffect(()=>{ if(t) onGameOver(t.score); },[t,onGameOver]);
  if (state.phase==="done") return <div className="dm-wrap"><div className="dm-done"><h2>{state.winner==="player"?"You Win!":"AI Wins"}</h2><p>You: {state.player} / AI: {state.ai}</p><div className="dm-final">{state.winner==="player"?100+state.player:state.player} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">First to {TARGET}</div>
      <div className="dm-row">
        <div className="dm-tally-item">You: {state.player}</div>
        <div className="dm-tally-item">AI: {state.ai}</div>
      </div>
      {state.lastP!==null && (<div className="dm-row"><div className="dm-die">{state.lastP}</div><div className="dm-die" style={{ background:"#fdedec" }}>{state.lastA}</div></div>)}
      {state.lastResult && <div className="dm-result">{state.lastResult==="tie"?"Tie!":state.lastResult==="player"?`You +${state.lastP}`:`AI +${state.lastA}`}</div>}
      <button className="dm-btn" onClick={()=>dispatch({type:"roll"} as DiceShootoutAction)}>Roll Both</button>
    </div>
  );
}
