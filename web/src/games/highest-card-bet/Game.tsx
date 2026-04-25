import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HighestCardBetState, HighestCardBetAction, HighestCardBetSettings } from "./state.js";
import { isTerminal, cardName, cardValue } from "./state.js";
import "./Game.css";

export function HighestCardBet({ state, dispatch, onGameOver }: GameProps<HighestCardBetState, HighestCardBetSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);

  const curName=cardName(state.currentCard);
  const nxtName=state.phase==="reveal"||state.phase==="gameover" ? cardName(state.nextCard) : "?";
  const betAmounts=[5,10,20,50];

  if(state.phase==="gameover") return (
    <div className="card-game-wrap">
      <h2>Game Over!</h2>
      <p>Final chips: <strong>{state.chips}</strong></p>
      <p style={{color:state.chips>100?"green":"red"}}>{state.chips>100?`Profit: +${state.chips-100}`:`Loss: ${state.chips-100}`}</p>
    </div>
  );

  return (
    <div className="card-game-wrap">
      <div className="card-game-header">
        <span>Round {state.round}/{state.maxRounds}</span>
        <span>Chips: <strong>{state.chips}</strong></span>
      </div>
      <div className="card-game-cards">
        <div className="playing-card">{curName}<br/><small>val {cardValue(state.currentCard)}</small></div>
        <div style={{fontSize:"2rem"}}>vs</div>
        <div className={`playing-card ${state.phase==="reveal"?(cardValue(state.nextCard)>cardValue(state.currentCard)?"card-win":"card-lose"):""}`}>{nxtName}</div>
      </div>
      {state.phase==="betting" && (
        <div>
          <p>The next card will be <strong>higher</strong> than {curName}. Bet how much?</p>
          <div className="card-game-bets">
            {betAmounts.filter(b=>b<=state.chips).map(b=>(
              <button key={b} className="bet-btn" onClick={()=>dispatch({type:"bet",amount:b} as HighestCardBetAction)}>{b}</button>
            ))}
            {state.chips>0&&<button className="bet-btn all-in" onClick={()=>dispatch({type:"bet",amount:state.chips} as HighestCardBetAction)}>All In ({state.chips})</button>}
          </div>
        </div>
      )}
      {state.phase==="reveal" && (
        <div>
          <p className={`result-msg ${state.lastResult}`}>{state.lastResult==="win"?`Won! +${state.bet}`:state.lastResult==="tie"?"Tie — no change":`Lost! -${state.bet}`}</p>
          <button className="bet-btn" onClick={()=>dispatch({type:"next"} as HighestCardBetAction)}>Next Round</button>
        </div>
      )}
    </div>
  );
}
