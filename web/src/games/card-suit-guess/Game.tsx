import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSuitGuessState, CardSuitGuessAction, CardSuitGuessSettings } from "./state.js";
import { isTerminal, cardName, cardSuit, SUIT_NAMES } from "./state.js";
import "./Game.css";
export function CardSuitGuess({ state, dispatch, onGameOver }: GameProps<CardSuitGuessState, CardSuitGuessSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  const isReveal=state.phase==="reveal";
  const suitColors=["#2c3e50","#e74c3c","#e74c3c","#2c3e50"];
  return <div className="card-game-wrap">
    <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
    <div className="card-game-cards">
      <div className={`playing-card ${isReveal?(state.lastResult==="correct"?"card-win":"card-lose"):""}`} style={{fontSize:"2rem"}}>
        {isReveal?cardName(state.currentCard):"?"}
      </div>
    </div>
    {!isReveal&&<div><p>Which suit?</p><div className="card-game-bets">
      {([0,1,2,3] as const).map(s=><button key={s} className="bet-btn" style={{background:suitColors[s]}} onClick={()=>dispatch({type:"guess",suit:s} as CardSuitGuessAction)}>{SUIT_NAMES[s]}</button>)}
    </div></div>}
    {isReveal&&<div>
      <p className={`result-msg ${state.lastResult}`}>{state.lastResult==="correct"?"+250 pts! Correct!":"Wrong!"} — {cardName(state.currentCard)} ({SUIT_NAMES[cardSuit(state.currentCard)]})</p>
      <button data-testid="hint-target-card-suit-guess-next" className="bet-btn" onClick={()=>dispatch({type:"next"} as CardSuitGuessAction)}>Next</button>
    </div>}
  </div>;
}
