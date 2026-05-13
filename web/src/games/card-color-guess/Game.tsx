import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardColorGuessState, CardColorGuessAction, CardColorGuessSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `ccg-${c}` };
}

export function CardColorGuess({ state, dispatch, onGameOver }: GameProps<CardColorGuessState, CardColorGuessSettings>): JSX.Element {
  const terminal=isTerminal(state);
  useEffect(()=>{ if(terminal) onGameOver(terminal.score); },[terminal,onGameOver]);
  if(state.phase==="gameover") return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Streak peak: {state.streak}</p></div>;
  const isReveal=state.phase==="reveal";
  return <div className="card-game-wrap">
    <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score} | Streak: {state.streak}</span></div>
    <div className="card-game-cards">
      {isReveal
        ? <Card card={toEngineCard(state.currentCard)} className={`playing-card ${state.lastResult==="correct"?"card-win":"card-lose"}`} />
        : <Card faceDown className="playing-card" />}
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
