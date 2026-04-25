import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LowestCardBetState, LowestCardBetAction, LowestCardBetSettings } from "./state.js";
import { isTerminal, cardName, cardValue } from "./state.js";
import "./Game.css";
export function LowestCardBet({ state, dispatch, onGameOver }: GameProps<LowestCardBetState, LowestCardBetSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  const betAmounts=[5,10,20,50];
  if(state.phase==="gameover") return <div className="card-game-wrap"><h2>Game Over!</h2><p>Final chips: <strong>{state.chips}</strong></p></div>;
  const nxtName=state.phase==="reveal"?cardName(state.nextCard):"?";
  return <div className="card-game-wrap">
    <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Chips: <strong>{state.chips}</strong></span></div>
    <div className="card-game-cards">
      <div className="playing-card">{cardName(state.currentCard)}<br/><small>val {cardValue(state.currentCard)}</small></div>
      <div style={{fontSize:"2rem"}}>vs</div>
      <div className={`playing-card ${state.phase==="reveal"?(cardValue(state.nextCard)<cardValue(state.currentCard)?"card-win":"card-lose"):""}`}>{nxtName}</div>
    </div>
    {state.phase==="betting"&&<div><p>Bet that the next card is <strong>lower</strong> than {cardName(state.currentCard)}:</p>
      <div className="card-game-bets">
        {betAmounts.filter(b=>b<=state.chips).map(b=><button key={b} className="bet-btn" onClick={()=>dispatch({type:"bet",amount:b} as LowestCardBetAction)}>{b}</button>)}
        {state.chips>0&&<button className="bet-btn all-in" onClick={()=>dispatch({type:"bet",amount:state.chips} as LowestCardBetAction)}>All In</button>}
      </div></div>}
    {state.phase==="reveal"&&<div>
      <p className={`result-msg ${state.lastResult}`}>{state.lastResult==="win"?`Won! +${state.bet}`:state.lastResult==="tie"?"Tie":`Lost! -${state.bet}`}</p>
      <button className="bet-btn" onClick={()=>dispatch({type:"next"} as LowestCardBetAction)}>Next</button>
    </div>}
  </div>;
}
