import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPileBetState, CardPileBetAction, CardPileBetSettings } from "./state.js";
import { isTerminal, cardName, cardColor } from "./state.js";
import "./Game.css";

export function CardPileBet({ state, dispatch, onGameOver }: GameProps<CardPileBetState, CardPileBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const topColor = cardColor(state.topCard);
  const isReveal = state.phase === "reveal";

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      <p style={{ color: "#555" }}>Current top card:</p>
      <div className="card-game-cards">
        <div className="playing-card" style={{ fontSize: "1.8rem", color: topColor === "red" ? "#e74c3c" : "#2c3e50" }}>
          {cardName(state.topCard)}
        </div>
        {isReveal && state.nextCard !== null && (
          <div className={`playing-card ${state.result === "correct" ? "card-win" : "card-lose"}`}
            style={{ fontSize: "1.8rem", color: cardColor(state.nextCard) === "red" ? "#e74c3c" : "#2c3e50" }}>
            {cardName(state.nextCard)}
          </div>
        )}
      </div>
      {!isReveal && <p style={{ fontSize: "0.9rem", color: "#888" }}>Will the next card be Red or Black?</p>}
      {!isReveal && (
        <div className="card-game-bets">
          <button className="bet-btn" style={{ background: "#e74c3c" }} onClick={() => dispatch({ type: "bet", color: "red" } as CardPileBetAction)}>Red +20/-10</button>
          <button className="bet-btn" style={{ background: "#2c3e50" }} onClick={() => dispatch({ type: "bet", color: "black" } as CardPileBetAction)}>Black +20/-10</button>
        </div>
      )}
      {isReveal && (
        <div>
          <p className={`result-msg ${state.result}`}>{state.result === "correct" ? "+20 pts!" : "-10 pts"}</p>
          <button className="bet-btn" onClick={() => dispatch({ type: "next" } as CardPileBetAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
