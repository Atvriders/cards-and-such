import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BalloonDartsState, BalloonDartsAction, BalloonDartsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const W=340,H=300;
const COLORS=["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c"];

export function BalloonDarts({ state, dispatch, onGameOver }: GameProps<BalloonDartsState, BalloonDartsSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);

  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Balloons popped: {state.balloons.filter(b=>b.popped).length}/{state.balloons.length}</p></div>;

  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Darts: {state.dartsLeft}</span><span>Score: {state.score}</span></div>
    <svg width={W} height={H} style={{border:"2px solid #e74c3c",borderRadius:"12px",background:"#fdf6e3",cursor:"crosshair"}}
      onClick={(e)=>{
        const rect=e.currentTarget.getBoundingClientRect();
        dispatch({type:"throw",x:(e.clientX-rect.left)/W,y:(e.clientY-rect.top)/H} as BalloonDartsAction);
      }}>
      {state.balloons.map((b,i)=>!b.popped&&(
        <circle key={b.id} cx={b.x*W} cy={b.y*H} r={b.radius*W} fill={COLORS[i%COLORS.length]} stroke="#fff" strokeWidth="2" style={{cursor:"crosshair"}}/>
      ))}
    </svg>
    <p style={{fontSize:"0.85rem",color:"#888"}}>Click to throw a dart at balloons!</p>
  </div>;
}
