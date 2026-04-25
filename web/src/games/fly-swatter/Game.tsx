import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlySwatterState, FlySwatterAction, FlySwatterSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FlySwatter({ state, dispatch, onGameOver }: GameProps<FlySwatterState, FlySwatterSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(terminal||state.phase!=="playing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"tick"} as FlySwatterAction),60);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[terminal,state.phase,dispatch]);

  const W=340,H=320;
  if(terminal||state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Swatted: {state.swatted}</p><p>Score: <strong>{state.score}</strong></p></div>;

  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Score: {state.score}</span><span>Swatted: {state.swatted}/50</span></div>
    <div style={{position:"relative",width:W,height:H,background:"#f9f9f0",border:"2px solid #27ae60",borderRadius:"12px",overflow:"hidden",cursor:"none"}}>
      {state.flies.map(f=>(
        <button key={f.id} onClick={()=>dispatch({type:"swat",id:f.id} as FlySwatterAction)}
          style={{position:"absolute",left:f.x*W-14,top:f.y*H-14,width:28,height:28,borderRadius:"50%",
            background:"#2c3e50",border:"none",fontSize:"1.1rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
          ✕
        </button>
      ))}
    </div>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Swat 50 flies to win! Click the moving dots.</p>
  </div>;
}
