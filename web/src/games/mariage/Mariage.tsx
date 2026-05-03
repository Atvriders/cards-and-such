import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MariageState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Mariage.css";

type MariageAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

// Highlight K/Q of same suit as potential marriage
function hasMarriagePartner(hand: readonly { rank: number; suit: string }[], card: { rank: number; suit: string }): boolean {
  if (card.rank === 13) return hand.some(c => c.suit === card.suit && c.rank === 12);
  if (card.rank === 12) return hand.some(c => c.suit === card.suit && c.rank === 13);
  return false;
}

export function Mariage({ state, dispatch, onGameOver }: GameProps<MariageState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, trumpCard, stock, currentTrick, scores, phase, message } = state;
  const playerHand = hands[0]!;

  return (
    <div className="mariage">
      <div className="mariage-header">
        <span>You: {scores[0]} pts</span>
        <span>Bot: {scores[1]} pts</span>
        <span>Target: 66</span>
      </div>
      <div className="mariage-trump">
        Trump: <strong style={{ color: isRed(trumpSuit) ? "#c62828" : "#333" }}>{trumpSuit}</strong>
        {" "}({trumpCard.suit}{rankLabel(trumpCard.rank)})
        {" "}| Stock: {stock.length} cards
      </div>
      <div className="mariage-message">{message}</div>

      <div className="mariage-trick">
        {currentTrick.length === 0
          ? <span className="mariage-label">— lead a card —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="mariage-label">{seat === 0 ? "You" : "Bot"}</div>
              <div className={`mariage-card${isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardValue(card.rank)}pt</div>
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="mariage-label">Your hand — click to play (orange = marriage pair):</div>
          <div className="mariage-hand">
            {playerHand.map(card => {
              const isMarr = hasMarriagePartner(playerHand, card);
              return (
                <div data-testid="hint-target-mariage-primary" key={card.id}
                  className={`mariage-card${isTrump(card, trumpSuit) ? " trump" : ""}${isMarr ? " marriage" : ""}`}
                  style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                  onClick={() => dispatch({ type: "play", cardId: card.id } as MariageAction)}
                >
                  {card.suit}{rankLabel(card.rank)}
                  <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardValue(card.rank)}pt</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
