import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumberRecallState, NumberRecallAction, NumberRecallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function NumberRecall({ state, dispatch, onGameOver }: GameProps<NumberRecallState, NumberRecallSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(state.phase!=="showing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"advance"} as NumberRecallAction),900);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[state.phase,dispatch]);
  if(state.phase==="gameover") return <div className="memory-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const showDigit=state.phase==="showing"&&state.showingIndex<state.sequence.length?state.sequence[state.showingIndex]:null;
  return <div className="memory-wrap">
    <div className="memory-header"><span>Round {state.round}/{state.maxRounds} | {state.sequence.length} digits</span><span>Score: {state.score}</span></div>
    {state.phase==="showing"&&<div style={{width:100,height:100,borderRadius:"12px",background:"#2c3e50",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3.5rem",fontWeight:900,color:"#ecf0f1",margin:"0 auto"}}>{showDigit??""}</div>}
    {state.phase==="showing"&&<p style={{color:"#888"}}>Remember this... ({state.showingIndex+1}/{state.sequence.length})</p>}
    {state.phase==="input"&&<div>
      <p>Type the digits in order!</p>
      <p style={{letterSpacing:"8px",fontSize:"1.5rem",fontWeight:700}}>{state.userInput.join("") || "—"}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,54px)",gap:"8px",justifyContent:"center"}}>
        {[1,2,3,4,5,6,7,8,9,0].map(d=><button key={d} onClick={()=>dispatch({type:"pick",digit:d} as NumberRecallAction)} style={{width:54,height:54,borderRadius:"8px",border:"2px solid #bdc3c7",background:"#fff",fontSize:"1.4rem",fontWeight:700,cursor:"pointer"}}>{d}</button>)}
      </div>
    </div>}
    {state.phase==="result"&&<div>
      <p style={{fontWeight:700,color:state.correct?"#27ae60":"#e74c3c"}}>{state.correct?`Correct! +${state.sequence.length*40} pts`:`Wrong! Answer: ${state.sequence.join("")}`}</p>
      <button className="memory-btn" onClick={()=>dispatch({type:"nextRound"} as NumberRecallAction)}>Next Round</button>
    </div>}
  </div>;
}
