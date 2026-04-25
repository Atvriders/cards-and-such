import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RingTossProState, RingTossProAction, RingTossProSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const W=300,H=300;
export function RingTossPro({ state, dispatch, onGameOver }: GameProps<RingTossProState, RingTossProSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const PEG_COLORS:{[k:number]:string}={500:"#e74c3c",200:"#3498db",100:"#27ae60"};
  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Rings: {state.ringsLeft}</span><span>Score: {state.score}</span></div>
    {state.lastLanded!==null&&<p style={{fontWeight:700,color:"#e67e22"}}>Landed on peg {state.lastLanded}! +{state.pegs.find(p=>p.id===state.lastLanded)?.points??0}</p>}
    {state.lastLanded===null&&state.ringsLeft<(parseInt("10")|| 10)&&<p style={{color:"#e74c3c"}}>Missed!</p>}
    <svg width={W} height={H} style={{border:"2px solid #8e44ad",borderRadius:"12px",background:"#f5eef8",cursor:"crosshair"}}
      onClick={(e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        dispatch({type:"toss",x:(e.clientX-rect.left)/W,y:(e.clientY-rect.top)/H} as RingTossProAction);
      }}>
      {state.pegs.map(p=>(
        <g key={p.id}>
          <circle cx={p.x*W} cy={p.y*H} r={19.5} fill="none" stroke={PEG_COLORS[p.points]??"#888"} strokeWidth="3"/>
          <circle cx={p.x*W} cy={p.y*H} r={4} fill={PEG_COLORS[p.points]??"#888"}/>
          <text x={p.x*W} y={p.y*H+32} textAnchor="middle" fill="#555" fontSize="10">{p.points}</text>
        </g>
      ))}
    </svg>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click near a peg to toss! Center = 500 pts</p>
  </div>;
}
