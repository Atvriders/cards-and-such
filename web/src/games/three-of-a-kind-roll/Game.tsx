import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeOfAKindRollState, ThreeOfAKindRollAction, ThreeOfAKindRollSettings } from "./state.js";
import { isTerminal, isThreeOfAKind } from "./state.js";
import "./Game.css";
export function ThreeOfAKindRoll({ state, dispatch, onGameOver }: GameProps<ThreeOfAKindRollState, ThreeOfAKindRollSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="dice-game-wrap"><h2>Game Over!</h2><p>Total Score: <strong>{state.totalScore}</strong></p></div>;
  const isResult=state.phase==="result";
  const hasThree=isThreeOfAKind(state.dice);
  return <div className="dice-game-wrap">
    <div className="dice-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Total: {state.totalScore} | Try {state.attempts}/{state.maxAttempts}</span></div>
    <div className="dice-row">
      {state.dice.map((d,i)=>(
        <div key={i} className={`die`} onClick={()=>!isResult&&dispatch({type:"keep",index:i} as ThreeOfAKindRollAction)} style={{cursor:isResult?"default":"pointer",borderColor:state.kept[i]?"#27ae60":"#555",background:state.kept[i]?"#eafaf1":"#fff",borderWidth:state.kept[i]?"3px":"2px"}}>{d}</div>
      ))}
    </div>
    {!isResult&&hasThree&&<p style={{color:"#27ae60",fontWeight:700}}>Three of a Kind!</p>}
    {!isResult&&<p style={{fontSize:"0.85rem",color:"#888"}}>Click to keep dice. Early success = more points!</p>}
    {!isResult&&<div style={{display:"flex",gap:"12px"}}>
      {state.attempts<state.maxAttempts&&<button className="dice-btn" onClick={()=>dispatch({type:"roll"} as ThreeOfAKindRollAction)}>Reroll Unkept</button>}
      <button className="dice-btn" style={{background:"#27ae60"}} onClick={()=>dispatch({type:"bank"} as ThreeOfAKindRollAction)}>Score Now</button>
    </div>}
    {isResult&&<div>
      <p style={{fontWeight:700,fontSize:"1.3rem",color:state.gotThree?"#27ae60":"#e74c3c"}}>{state.gotThree?`Three of a Kind! +${state.score} pts`:"No three of a kind — 0 pts"}</p>
      <button className="dice-btn" onClick={()=>dispatch({type:"next"} as ThreeOfAKindRollAction)}>Next Round</button>
    </div>}
  </div>;
}
