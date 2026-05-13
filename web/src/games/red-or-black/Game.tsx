import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedOrBlackState, RedOrBlackAction, RedOrBlackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `rob-${c}` };
}

export function RedOrBlack({ state, dispatch, onGameOver }: GameProps<RedOrBlackState, RedOrBlackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Red seen: {state.redSeen} | Black seen: {state.blackSeen}</p></div>;
  }
  const isReveal = state.phase === "reveal";
  const redLeft = 26 - state.redSeen;
  const blackLeft = 26 - state.blackSeen;
  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>Red left ~{redLeft} | Black left ~{blackLeft}</p>
      <div className="card-game-cards">
        {isReveal && state.lastCard !== null
          ? <Card card={toEngineCard(state.lastCard)} className={`playing-card ${state.lastResult === "correct" ? "card-win" : "card-lose"}`} />
          : <Card faceDown className="playing-card" />}
      </div>
      {!isReveal && (
        <div className="card-game-bets">
          <button className="bet-btn" style={{ background: "#e74c3c" }} onClick={() => dispatch({ type: "guess", color: "red" } as RedOrBlackAction)}>Red ♥♦</button>
          <button className="bet-btn" style={{ background: "#2c3e50" }} onClick={() => dispatch({ type: "guess", color: "black" } as RedOrBlackAction)}>Black ♠♣</button>
        </div>
      )}
      {isReveal && (
        <div>
          <p className={`result-msg ${state.lastResult}`}>{state.lastResult === "correct" ? "Correct! +10 pts" : "Wrong!"}</p>
          <button className="bet-btn" onClick={() => dispatch({ type: "next" } as RedOrBlackAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
