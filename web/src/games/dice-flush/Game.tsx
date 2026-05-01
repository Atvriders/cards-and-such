import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceFlushState, DiceFlushAction, DiceFlushSettings } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import "./Game.css";
export function DiceFlush({ state, dispatch, onGameOver }: GameProps<DiceFlushState, DiceFlushSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="dflsh-game-wrap dflsh-theme"><h2>Game Over!</h2><p>Total Score: <strong>{state.totalScore}</strong></p></div>;
  const isResult=state.phase==="result";
  const pending=calcScore(state.dice);
  return <div className="dflsh-game-wrap dflsh-theme">
    <div className="dflsh-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Total: {state.totalScore} | Rerolls: {state.maxRerolls-state.rerolls} left</span></div>
    <div className="dflsh-row">
      {state.dice.map((d,i)=>(
        <div key={i} className={`die ${state.kept[i]?"kept":""}`} onClick={()=>!isResult&&dispatch({type:"keep",index:i} as DiceFlushAction)} style={{cursor:isResult?"default":"pointer",borderColor:state.kept[i]?"#27ae60":"#555",background:state.kept[i]?"#eafaf1":"#fff"}}>{d}</div>
      ))}
    </div>
    {!isResult&&<p style={{fontSize:"0.85rem",color:"#888"}}>Click dice to keep them, then Reroll or Score</p>}
    {!isResult&&<div style={{display:"flex",gap:"12px"}}>
      <button className="dflsh-btn" disabled={state.rerolls>=state.maxRerolls} onClick={()=>dispatch({type:"roll"} as DiceFlushAction)}>Reroll Unkept</button>
      <button className="dflsh-btn" style={{background:"#27ae60"}} onClick={()=>dispatch({type:"score"} as DiceFlushAction)}>Score ({pending} pts)</button>
    </div>}
    {isResult&&<div>
      <p style={{fontWeight:700,fontSize:"1.3rem"}}>Round score: {state.score} pts</p>
      <button className="dflsh-btn" onClick={()=>dispatch({type:"next"} as DiceFlushAction)}>Next Round</button>
    </div>}
  </div>;
}
