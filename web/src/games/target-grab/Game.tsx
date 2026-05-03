import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TargetGrabState, TargetGrabAction, TargetGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TargetGrab({ state, dispatch, onGameOver }: GameProps<TargetGrabState, TargetGrabSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);

  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(state.phase!=="playing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"tick"} as TargetGrabAction),80);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[state.phase,dispatch]);

  const W=340,H=340;

  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>{state.misses} target{state.misses!==1?"s":""} missed</p></div>;

  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Score: {state.score}</span><span>Misses: {state.misses}/{state.maxMisses}</span></div>
    <div style={{position:"relative",width:W,height:H,background:"#e8f4fd",border:"2px solid #3498db",borderRadius:"12px",overflow:"hidden",cursor:"crosshair"}}>
      {state.targets.filter(t=>!t.hit&&t.timeLeft>0).map(t=>{
        const pct=t.timeLeft/t.maxTime;
        const color=pct>0.6?"#e74c3c":pct>0.3?"#e67e22":"#f1c40f";
        return <button data-testid="hint-target-target-grab-action" key={t.id} onClick={()=>dispatch({type:"click",id:t.id} as TargetGrabAction)}
          style={{position:"absolute",left:(t.x-t.radius)*W,top:(t.y-t.radius)*H,width:t.radius*2*W,height:t.radius*2*H,
            borderRadius:"50%",background:color,border:"3px solid #fff",cursor:"crosshair",transition:"background 0.2s"}}/>;
      })}
    </div>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click targets before they fade! {3-state.misses} misses left</p>
  </div>;
}
