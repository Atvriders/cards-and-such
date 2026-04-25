import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShapeRecallState, ShapeRecallAction, ShapeRecallSettings } from "./state.js";
import { isTerminal, SHAPES } from "./state.js";
import "./Game.css";
const SHAPE_LABELS: Record<string,string> = { circle:"⬤", square:"■", triangle:"▲", star:"★", diamond:"◆", cross:"✚" };
const SHAPE_COLORS: Record<string,string> = { circle:"#e74c3c", square:"#3498db", triangle:"#27ae60", star:"#f1c40f", diamond:"#9b59b6", cross:"#e67e22" };
export function ShapeRecall({ state, dispatch, onGameOver }: GameProps<ShapeRecallState, ShapeRecallSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(state.phase!=="showing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"advance"} as ShapeRecallAction),900);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[state.phase,dispatch]);
  if(state.phase==="gameover") return <div className="memory-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const showShape=state.phase==="showing"&&state.showingIndex<state.sequence.length?state.sequence[state.showingIndex]:null;
  return <div className="memory-wrap">
    <div className="memory-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
    {state.phase==="showing"&&<div style={{width:110,height:110,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4.5rem",color:showShape?SHAPE_COLORS[showShape]:"#eee",background:"#f8f9fa",borderRadius:"12px",border:"3px solid #dee2e6",margin:"0 auto"}}>{showShape?SHAPE_LABELS[showShape]:""}</div>}
    {state.phase==="showing"&&<p style={{color:"#888"}}>{state.showingIndex+1}/{state.sequence.length}</p>}
    {state.phase==="input"&&<div>
      <p>Reproduce the sequence:</p>
      <p>{state.userInput.map((s,i)=><span key={i} style={{color:SHAPE_COLORS[s],fontSize:"1.5rem",margin:"0 3px"}}>{SHAPE_LABELS[s]}</span>)}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center"}}>
        {SHAPES.map(s=><button key={s} onClick={()=>dispatch({type:"pick",shape:s} as ShapeRecallAction)} style={{width:60,height:60,borderRadius:"10px",border:"2px solid #bdc3c7",background:"#fff",fontSize:"1.8rem",cursor:"pointer",color:SHAPE_COLORS[s]}}>{SHAPE_LABELS[s]}</button>)}
      </div>
    </div>}
    {state.phase==="result"&&<div>
      <p style={{fontWeight:700,color:state.correct?"#27ae60":"#e74c3c"}}>{state.correct?`Correct! +${state.sequence.length*50} pts`:"Wrong!"}</p>
      <button className="memory-btn" onClick={()=>dispatch({type:"nextRound"} as ShapeRecallAction)}>Next Round</button>
    </div>}
  </div>;
}
