import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlaverjasState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Klaverjas.css";

type KlaverjasAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

export function Klaverjas({ state, dispatch, onGameOver }: GameProps<KlaverjasState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, trumpCard, currentTrick, wonCards, phase, message } = state;
  const playerHand = hands[0]!;

  const pts02 = [...wonCards[0]!, ...wonCards[2]!].reduce((sum, c) => sum + cardValue(c.rank as never, c.suit === trumpSuit), 0);
  const pts13 = [...wonCards[1]!, ...wonCards[3]!].reduce((sum, c) => sum + cardValue(c.rank as never, c.suit === trumpSuit), 0);

  return (
    <div className="klaverjas">
      <div className="klaverjas-header">
        <span>Your team (You+S3): {pts02} pts</span>
        <span>Opponents (S2+S4): {pts13} pts</span>
      </div>
      <div className="klaverjas-trump">
        Trump: <strong style={{ color: isRed(trumpSuit) ? "#c62828" : "#333" }}>{trumpSuit}</strong>
        {" "}(turned up: {trumpCard.suit}{rankLabel(trumpCard.rank)})
      </div>
      <div className="klaverjas-message">{message}</div>

      <div className="klaverjas-trick">
        {currentTrick.length === 0
          ? <span className="klaverjas-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="klaverjas-label">{seat === 0 ? "You" : `S${seat + 1}`}</div>
              <div className={`klaverjas-card${isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {card.suit}{rankLabel(card.rank)}
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="klaverjas-label">Your hand — click to play:</div>
          <div className="klaverjas-hand">
            {playerHand.map(card => (
              <div key={card.id}
                className={`klaverjas-card${isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as KlaverjasAction)}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardValue(card.rank, isTrump(card, trumpSuit))}pt</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
