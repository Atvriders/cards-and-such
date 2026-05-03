import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLowHigh3State, CardLowHigh3Action, CardLowHigh3Settings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardLowHigh3({ state, dispatch, onGameOver }: GameProps<CardLowHigh3State, CardLowHigh3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const isResult = state.phase === "result";
  const ranks = state.cards.map(c => c % 13);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      <p style={{ fontSize: "0.95rem", color: "#555" }}>Pick a card and call it Low or High!</p>
      <div className="card-game-cards" style={{ gap: "12px" }}>
        {state.cards.map((card, i) => {
          const r = ranks[i]!;
          let cls = "playing-card";
          if (isResult && r === minRank) cls += " card-win";
          else if (isResult && r === maxRank) cls += " card-lose";
          return (
            <div key={i} className={cls} style={{ fontSize: "1.4rem", minWidth: "60px" }}>
              {cardName(card)}
            </div>
          );
        })}
      </div>
      {!isResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          {state.cards.map((card, i) => (
            <div key={i} className="card-game-bets">
              <button className="bet-btn" style={{ background: "#3498db", fontSize: "0.85rem" }}
                onClick={() => dispatch({ type: "pick", cardIdx: i, bet: "low" } as CardLowHigh3Action)}>
                {cardName(card)} = LOW
              </button>
              <button className="bet-btn" style={{ background: "#e74c3c", fontSize: "0.85rem" }}
                onClick={() => dispatch({ type: "pick", cardIdx: i, bet: "high" } as CardLowHigh3Action)}>
                {cardName(card)} = HIGH
              </button>
            </div>
          ))}
        </div>
      )}
      {isResult && (
        <div>
          <p className={`result-msg ${state.result}`}>{state.result === "correct" ? "+30 pts! Correct call!" : "Wrong! No points."}</p>
          <p style={{ fontSize: "0.85rem", color: "#888" }}>Low: {state.cards.filter(c => c % 13 === minRank).map(cardName).join(", ")} | High: {state.cards.filter(c => c % 13 === maxRank).map(cardName).join(", ")}</p>
          <button data-testid="hint-target-card-low-high-3-next" className="bet-btn" onClick={() => dispatch({ type: "next" } as CardLowHigh3Action)}>Next</button>
        </div>
      )}
    </div>
  );
}
