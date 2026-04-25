import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardColorGuessState, CardColorGuessAction, CardColorGuessSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";
export function CardColorGuess({ state, dispatch, onGameOver }: GameProps<CardColorGuessState, CardColorGuessSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Streak peak: {state.streak}</p></div>;
  const isReveal=state.phase==="reveal";
  return <div className="card-game-wrap">
    <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score} | Streak: {state.streak}</span></div>
    <div className="card-game-cards">
      <div className={`playing-card ${isReveal?(state.lastResult==="correct"?"card-win":"card-lose"):""}`} style={{fontSize:"2rem"}}>
        {isReveal?cardName(state.currentCard):"?"}
      </div>
    </div>
    {!isReveal&&<div className="card-game-bets">
      <button className="bet-btn" style={{background:"#e74c3c"}} onClick={()=>dispatch({type:"guess",color:"red"} as CardColorGuessAction)}>Red ♥♦</button>
      <button className="bet-btn" style={{background:"#2c3e50"}} onClick={()=>dispatch({type:"guess",color:"black"} as CardColorGuessAction)}>Black ♠♣</button>
    </div>}
    {isReveal&&<div>
      <p className={`result-msg ${state.lastResult}`}>{state.lastResult==="correct"?`Correct! +${10+state.streak*2} pts`:"Wrong!"} — {cardName(state.currentCard)}</p>
      <button className="bet-btn" onClick={()=>dispatch({type:"next"} as CardColorGuessAction)}>Next</button>
    </div>}
  </div>;
}
