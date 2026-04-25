import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BasketTossState, BasketTossAction, BasketTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const W=340,H=220;
export function BasketToss({ state, dispatch, onGameOver }: GameProps<BasketTossState, BasketTossSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="arcade-wrap"><h2>Game Over!</h2><p>Made: {state.madeIt}/{state.throws}</p><p>Score: <strong>{state.score}</strong></p></div>;
  const isResult=state.phase==="result";
  return <div className="arcade-wrap">
    <div className="arcade-header"><span>Balls: {state.ballsLeft}</span><span>Streak: {state.streak} | Score: {state.score}</span></div>
    <svg width={W} height={H} style={{border:"2px solid #e67e22",borderRadius:"12px",background:"#fef9e7",cursor:isResult?"default":"crosshair"}}
      onClick={(e)=>{
        if(isResult) return;
        const rect=e.currentTarget.getBoundingClientRect();
        dispatch({type:"toss",x:(e.clientX-rect.left)/W} as BasketTossAction);
      }}>
      {/* Basket */}
      <rect x={(state.basketX-0.07)*W} y={H*0.45-5} width={0.14*W} height={10} rx="3" fill="#e67e22"/>
      <text x={state.basketX*W} y={H*0.45+25} textAnchor="middle" fill="#e67e22" fontSize="10">BASKET</text>
      {/* Ball spawn */}
      <circle cx={W*0.5} cy={H*0.85} r={14} fill="#e74c3c" stroke="#c0392b" strokeWidth="2"/>
      <text x={W*0.5} y={H*0.85+5} textAnchor="middle" fill="#fff" fontSize="10">🏀</text>
    </svg>
    {isResult&&<div>
      <p style={{fontWeight:700,color:state.lastResult==="made"?"#27ae60":"#e74c3c"}}>{state.lastResult==="made"?`Made it! +${100+state.streak*20} pts`:"Missed!"}</p>
      <button className="bet-btn" style={{padding:"8px 20px",borderRadius:"8px",border:"none",background:"#e67e22",color:"#fff",cursor:"pointer",fontWeight:700}} onClick={()=>dispatch({type:"next"} as BasketTossAction)}>Next Ball</button>
    </div>}
    {!isResult&&<p style={{fontSize:"0.85rem",color:"#888"}}>Click at the basket position to toss!</p>}
  </div>;
}
