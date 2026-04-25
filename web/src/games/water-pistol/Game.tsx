import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WaterPistolState, WaterPistolAction, WaterPistolSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function WaterPistol({ state, dispatch, onGameOver }: GameProps<WaterPistolState, WaterPistolSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(terminal||state.phase!=="playing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"tick"} as WaterPistolAction),100);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[terminal,state.phase,dispatch]);
  const W=340,H=300;
  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Time's Up!</h2><p>Score: <strong>{state.score}</strong></p><p>Shots fired: {state.shots}</p></div>;
  const secsLeft=Math.ceil(state.timeLeft/10);
  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Time: {secsLeft}s</span><span>Score: {state.score}</span></div>
    <div style={{position:"relative",width:W,height:H,background:"#d6f5f5",border:"2px solid #1abc9c",borderRadius:"12px",cursor:"crosshair",overflow:"hidden"}}
      onClick={(e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        dispatch({type:"spray",x:(e.clientX-rect.left)/W,y:(e.clientY-rect.top)/H} as WaterPistolAction);
      }}>
      {state.targets.map(t=>(
        <div key={t.id} style={{position:"absolute",left:t.x*W-16,top:t.y*H-16,width:32,height:32,borderRadius:"50%",background:"#e74c3c",border:"2px solid #c0392b",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",pointerEvents:"none"}}>
          🎯
        </div>
      ))}
    </div>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click targets to soak them! +50 each</p>
  </div>;
}
