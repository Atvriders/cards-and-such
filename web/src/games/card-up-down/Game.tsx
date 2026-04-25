import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardUpDownState, CardUpDownAction, CardUpDownSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardUpDown({ state, dispatch, onGameOver }: GameProps<CardUpDownState, CardUpDownSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Best streak: {state.streak}</p></div>;
  }
  const isReveal = state.phase === "reveal";
  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score} | Streak: {state.streak}</span></div>
      <div className="card-game-cards">
        <div className={`playing-card${isReveal ? (state.lastResult === "correct" ? " card-win" : " card-lose") : ""}`} style={{ fontSize: "2rem" }}>
          {cardName(state.currentCard)}
        </div>
        {isReveal && state.nextCard !== null && (
          <div className="playing-card" style={{ fontSize: "2rem" }}>{cardName(state.nextCard)}</div>
        )}
      </div>
      <p style={{ color: "#555", fontSize: "0.95rem" }}>Will the next card rank higher or lower?</p>
      {!isReveal && (
        <div className="card-game-bets">
          <button className="bet-btn" style={{ background: "#27ae60" }} onClick={() => dispatch({ type: "guess", dir: "up" } as CardUpDownAction)}>Higher</button>
          <button className="bet-btn" style={{ background: "#e74c3c" }} onClick={() => dispatch({ type: "guess", dir: "down" } as CardUpDownAction)}>Lower</button>
        </div>
      )}
      {isReveal && (
        <div>
          <p className={`result-msg ${state.lastResult}`}>{state.lastResult === "correct" ? `Correct! +${10 + state.streak * 2} pts` : "Wrong!"}</p>
          <button className="bet-btn" onClick={() => dispatch({ type: "next" } as CardUpDownAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
