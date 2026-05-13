import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaperArrowState, PaperArrowAction, PaperArrowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function PaperArrow({ state, dispatch, onGameOver }: GameProps<PaperArrowState, PaperArrowSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  // We simulate tick in state via targetVX; no separate tick action needed (static target display)
  const W=340,H=160;
  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Hits: {state.hits}/{state.throws}</p><p>Score: <strong>{state.score}</strong></p></div>;
  return <div className="arcade-wrap fade-in">
    <div className="arcade-header"><span>Arrows: {state.arrowsLeft}</span><span>Hits: {state.hits} | Score: {state.score}</span></div>
    {state.throws>0&&<p style={{fontSize:"0.9rem",fontWeight:700,color:state.lastHit?"#27ae60":"#e74c3c"}}>{state.lastHit?"Hit! +pts":"Miss!"}</p>}
    <svg width={W} height={H} style={{border:"2px solid #8e44ad",borderRadius:"12px",background:"#f0f0f0",cursor:"crosshair"}}
      onClick={(e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        dispatch({type:"shoot",x:(e.clientX-rect.left)/W} as PaperArrowAction);
      }}>
      {/* Target */}
      <circle cx={state.targetX*W} cy={H*0.4} r={20} fill="#e74c3c" stroke="#fff" strokeWidth="3"/>
      <circle cx={state.targetX*W} cy={H*0.4} r={10} fill="#f1c40f"/>
      <circle cx={state.targetX*W} cy={H*0.4} r={4} fill="#e74c3c"/>
      {/* Archer position */}
      <rect x={W*0.45} y={H*0.75} width={20} height={20} rx="3" fill="#2c3e50"/>
      <text x={W*0.5} y={H*0.87} textAnchor="middle" fill="#ecf0f1" fontSize="10">🏹</text>
    </svg>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click at the target's X position to shoot!</p>
  </div>;
}
