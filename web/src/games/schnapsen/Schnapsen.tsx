import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SchnapsenState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Schnapsen.css";

type SchnapsenAction = { type: "play"; cardId: string } | { type: "marriage" };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

export function Schnapsen({ state, dispatch, onGameOver }: GameProps<SchnapsenState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, trumpCard, stock, currentTrick, scores, phase, message } = state;
  const playerHand = hands[0]!;

  return (
    <div className="schnapsen">
      <div className="schnapsen-header">
        <span>You: {scores[0]} pts</span>
        <span>Bot: {scores[1]} pts</span>
        <span>Target: 66</span>
      </div>
      <div className="schnapsen-trump">
        Trump: <strong style={{ color: isRed(trumpSuit) ? "#c62828" : "#333" }}>{trumpSuit}</strong>
        {" "}({trumpCard.suit}{rankLabel(trumpCard.rank)})
        {" "}| Stock: {stock.length} cards
      </div>
      <div className="schnapsen-message">{message}</div>

      <div className="schnapsen-trick">
        {currentTrick.length === 0
          ? <span className="schnapsen-label">— lead a card —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="schnapsen-label">{seat === 0 ? "You" : "Bot"}</div>
              <div className={`schnapsen-card${isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardValue(card.rank)}pt</div>
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="schnapsen-label">Your hand — click to play:</div>
          <div className="schnapsen-hand">
            {playerHand.map(card => (
              <div key={card.id}
                className={`schnapsen-card${isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as SchnapsenAction)}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardValue(card.rank)}pt</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
