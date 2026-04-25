import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Total7OrNotState, Total7OrNotAction, Total7OrNotSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function Total7OrNot({ state, dispatch, onGameOver }: GameProps<Total7OrNotState, Total7OrNotSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="dice-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const total=state.dice.length?state.dice[0]!+state.dice[1]!:0;
  const isReveal=state.phase==="reveal";
  return <div className="dice-game-wrap">
    <div className="dice-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
    {isReveal&&<div className="dice-row">{state.dice.map((d,i)=><div key={i} className="die">{d}</div>)}</div>}
    {isReveal&&<p style={{fontWeight:700,fontSize:"1.4rem"}}>Total: {total} — {total===7?"SEVEN!":"Not 7"}</p>}
    {!isReveal&&<p style={{fontSize:"1.2rem"}}>Will 2 dice total exactly <strong>7</strong>?</p>}
    {!isReveal&&<p style={{fontSize:"0.85rem",color:"#888"}}>Seven: +200 pts if correct | Not Seven: +50 pts if correct</p>}
    {!isReveal&&<div className="dice-btns">
      <button className="dice-btn even" style={{background:"#e67e22"}} onClick={()=>dispatch({type:"guess",value:"seven"} as Total7OrNotAction)}>Seven (7)</button>
      <button className="dice-btn odd" style={{background:"#7f8c8d"}} onClick={()=>dispatch({type:"guess",value:"not"} as Total7OrNotAction)}>Not Seven</button>
    </div>}
    {isReveal&&<div>
      <p className={`result-msg ${state.lastResult===("seven" as string)===false?"wrong":"correct"}`} style={{color:state.lastResult==="seven"?"#e67e22":"#95a5a6"}}>
        The result was: {state.lastResult==="seven"?"SEVEN!":"Not 7"}</p>
      <button className="dice-btn" onClick={()=>dispatch({type:"next"} as Total7OrNotAction)}>Next</button>
    </div>}
  </div>;
}
