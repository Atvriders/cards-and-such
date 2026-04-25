import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EvensOrOddsDiceState, EvensOrOddsDiceAction, EvensOrOddsDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function EvensOrOddsDice({ state, dispatch, onGameOver }: GameProps<EvensOrOddsDiceState, EvensOrOddsDiceSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="dice-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const total=state.dice.reduce((a,b)=>a+b,0);
  const isReveal=state.phase==="reveal";
  return <div className="dice-game-wrap">
    <div className="dice-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score} | Streak: {state.streak}</span></div>
    {isReveal&&<div className="dice-row">{state.dice.map((d,i)=><div key={i} className="die">{d}</div>)}</div>}
    {isReveal&&<p style={{fontWeight:700}}>Total: {total} — {total%2===0?"EVEN":"ODD"}</p>}
    {!isReveal&&<p style={{fontSize:"1.2rem"}}>Will 3 dice total be <strong>even</strong> or <strong>odd</strong>?</p>}
    {!isReveal&&<div className="dice-btns">
      <button className="dice-btn even" onClick={()=>dispatch({type:"guess",value:"even"} as EvensOrOddsDiceAction)}>Even</button>
      <button className="dice-btn odd" onClick={()=>dispatch({type:"guess",value:"odd"} as EvensOrOddsDiceAction)}>Odd</button>
    </div>}
    {isReveal&&<div>
      <p className={`result-msg ${state.lastResult}`}>{state.lastResult==="correct"?`Correct! +${50+state.streak*10} pts`:"Wrong!"}</p>
      <button className="dice-btn" onClick={()=>dispatch({type:"roll"} as EvensOrOddsDiceAction)}>Next Roll</button>
    </div>}
  </div>;
}
