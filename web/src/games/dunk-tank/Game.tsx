import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DunkTankState, DunkTankAction, DunkTankSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DunkTank({ state, dispatch, onGameOver }: GameProps<DunkTankState, DunkTankSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(terminal||state.phase==="gameover"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"tick"} as DunkTankAction),50);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[terminal,state.phase,dispatch]);

  const W=340,H=200;
  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Dunks: {state.dunks}/{state.throws}</p><p>Score: <strong>{state.score}</strong></p></div>;

  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Balls: {state.ballsLeft}</span><span>Dunks: {state.dunks} | Score: {state.score}</span></div>
    <svg width={W} height={H} style={{border:"2px solid #3498db",borderRadius:"12px",background:"#d6eaf8",cursor:"crosshair"}}
      onClick={(e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        const x=(e.clientX-rect.left)/W;
        dispatch({type:"throw",x} as DunkTankAction);
      }}>
      {/* Moving target platform */}
      <rect x={(state.targetX-0.06)*W} y={state.targetY*H-10} width={0.12*W} height={20} rx="4" fill="#e74c3c" stroke="#fff" strokeWidth="2"/>
      <text x={state.targetX*W} y={state.targetY*H+5} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">TARGET</text>
      {/* Water */}
      <rect x={0} y={H*0.7} width={W} height={H*0.3} fill="#2e86c1" opacity="0.4"/>
    </svg>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click to throw! Hit the moving red target!</p>
  </div>;
}
