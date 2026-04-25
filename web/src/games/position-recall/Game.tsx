import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PositionRecallState, PositionRecallAction, PositionRecallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function PositionRecall({ state, dispatch, onGameOver }: GameProps<PositionRecallState, PositionRecallSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(state.phase!=="showing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"advance"} as PositionRecallAction),800);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[state.phase,dispatch]);
  if(state.phase==="gameover") return <div className="memory-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const activeCell=state.phase==="showing"&&state.showingIndex<state.sequence.length?state.sequence[state.showingIndex]:-1;
  return <div className="memory-wrap">
    <div className="memory-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
    {state.phase==="showing"&&<p style={{color:"#888"}}>Watch: {state.showingIndex+1}/{state.sequence.length}</p>}
    {state.phase==="input"&&<p>Click the cells in the same order!</p>}
    {state.phase==="result"&&<p style={{fontWeight:700,color:state.correct?"#27ae60":"#e74c3c"}}>{state.correct?`Correct! +${state.sequence.length*60} pts`:"Wrong!"}</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,80px)",gap:"8px"}}>
      {Array.from({length:9},(_,i)=>(
        <button key={i} onClick={()=>state.phase==="input"&&dispatch({type:"pick",index:i} as PositionRecallAction)}
          style={{width:80,height:80,borderRadius:"12px",border:"2px solid #bdc3c7",cursor:state.phase==="input"?"pointer":"default",
            background:i===activeCell?"#f1c40f":state.phase==="input"&&state.userInput.includes(i)?"#3498db":"#ecf0f1",
            fontWeight:700,fontSize:"1.2rem",color:"#2c3e50",transition:"background 0.15s"}}>
          {state.phase==="input"?state.userInput.indexOf(i)+1||"":i===activeCell?"★":""}
        </button>
      ))}
    </div>
    {state.phase==="result"&&<button className="memory-btn" onClick={()=>dispatch({type:"nextRound"} as PositionRecallAction)}>Next Round</button>}
  </div>;
}
