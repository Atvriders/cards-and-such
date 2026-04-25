import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorRecallState, ColorRecallAction, ColorRecallSettings } from "./state.js";
import { isTerminal, COLORS } from "./state.js";
import "./Game.css";

const COLOR_MAP: Record<string,string> = { red:"#e74c3c",blue:"#3498db",green:"#27ae60",yellow:"#f1c40f",purple:"#9b59b6",orange:"#e67e22" };

export function ColorRecall({ state, dispatch, onGameOver }: GameProps<ColorRecallState, ColorRecallSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);

  const tickRef=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{
    if(state.phase!=="showing"){if(tickRef.current)clearInterval(tickRef.current);return;}
    tickRef.current=setInterval(()=>dispatch({type:"advance"} as ColorRecallAction),800);
    return ()=>{if(tickRef.current)clearInterval(tickRef.current);};
  },[state.phase,dispatch]);

  if(state.phase==="gameover") return <div className="memory-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;

  const showColor=state.phase==="showing"&&state.showingIndex<state.sequence.length?state.sequence[state.showingIndex]:null;

  return <div className="memory-wrap">
    <div className="memory-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
    <p>Sequence length: {state.sequence.length}</p>
    {state.phase==="showing"&&<div style={{width:120,height:120,borderRadius:"50%",background:showColor?COLOR_MAP[showColor]:"#eee",border:"4px solid #555",margin:"0 auto",transition:"background 0.2s"}}/>}
    {state.phase==="showing"&&<p style={{color:"#888"}}>Watch the colors... ({state.showingIndex+1}/{state.sequence.length})</p>}
    {state.phase==="input"&&<div>
      <p>Now repeat the sequence!</p>
      <p style={{fontSize:"0.85rem",color:"#888"}}>Your input: {state.userInput.map(c=><span key={c+Math.random()} style={{display:"inline-block",width:20,height:20,borderRadius:"50%",background:COLOR_MAP[c],margin:"0 2px",verticalAlign:"middle"}}/>)}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center"}}>
        {COLORS.map(c=><button key={c} onClick={()=>dispatch({type:"pick",color:c} as ColorRecallAction)} style={{width:60,height:60,borderRadius:"50%",background:COLOR_MAP[c],border:"3px solid #fff",cursor:"pointer"}}/>)}
      </div>
    </div>}
    {state.phase==="result"&&<div>
      <p style={{fontWeight:700,color:state.correct?"#27ae60":"#e74c3c"}}>{state.correct?`Correct! +${state.sequence.length*50} pts`:"Wrong!"}</p>
      <button className="memory-btn" onClick={()=>dispatch({type:"nextRound"} as ColorRecallAction)}>Next Round</button>
    </div>}
  </div>;
}
