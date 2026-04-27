import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceMarathonState, DiceMarathonAction, DiceMarathonSettings } from "./state.js";
import { isTerminal, TOTAL_ROLLS } from "./state.js";
import "./Game.css";
export function DiceMarathonGame({ state, dispatch, onGameOver }: GameProps<DiceMarathonState, DiceMarathonSettings>): JSX.Element {
  const t=isTerminal(state);
  useEffect(()=>{ if(t) onGameOver(t.score); },[t,onGameOver]);
  if (state.phase==="done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Total pips: {state.total}</p><div className="dm-final">{state.score} pts</div></div></div>;
  const max = Math.max(1, ...state.counts);
  return (
    <div className="dm-wrap">
      <div className="dm-info">Roll {state.rolls} / {TOTAL_ROLLS}</div>
      <div className="dm-score">{state.score} pts (total pips)</div>
      {state.lastRoll!==null && <div className="dm-die">{state.lastRoll}</div>}
      <div className="dm-tally" style={{ flexDirection:"column", alignItems:"flex-start" }}>
        {state.counts.map((c,i)=>(<div key={i} style={{ display:"flex", alignItems:"center" }}><div className="dm-tally-item">{i+1}: {c}</div><div className="dm-bar"><div className="dm-bar-fill" style={{ width:`${(c/max)*100}%` }} /></div></div>))}
      </div>
      <div className="dm-row">
        <button className="dm-btn" onClick={()=>dispatch({type:"roll"} as DiceMarathonAction)}>Roll 1</button>
        <button className="dm-btn alt" onClick={()=>dispatch({type:"rollAll"} as DiceMarathonAction)}>Roll All</button>
      </div>
    </div>
  );
}
