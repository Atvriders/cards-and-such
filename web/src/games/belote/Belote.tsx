import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeloteState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Belote.css";

type BeloteAction =
  | { type: "accept" }
  | { type: "pass" }
  | { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

export function Belote({ state, dispatch, onGameOver }: GameProps<BeloteState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, turnUpCard, currentTrick, wonCards, phase, message } = state;
  const playerHand = hands[0]!;

  const pts02 = wonCards[0]!.concat(wonCards[2]! as typeof wonCards[0]).reduce(
    (sum, c) => sum + cardValue(c.rank, trumpSuit ? isTrump(c, trumpSuit) : false), 0
  );
  const pts13 = wonCards[1]!.concat(wonCards[3]! as typeof wonCards[0]).reduce(
    (sum, c) => sum + cardValue(c.rank, trumpSuit ? isTrump(c, trumpSuit) : false), 0
  );

  const cardEl = (card: { suit: string; rank: number; id: string }, clickable = false) => (
    <div key={card.id}
      className={`belote-card${trumpSuit && card.suit === trumpSuit ? " trump" : ""}`}
      style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: clickable ? "pointer" : "default" }}
      onClick={clickable ? () => dispatch({ type: "play", cardId: card.id } as BeloteAction) : undefined}
    >
      {card.suit}{rankLabel(card.rank)}
    </div>
  );

  return (
    <div className="belote">
      <div className="belote-header">
        <span>Your team (You+S3): {pts02} pts</span>
        <span>Opponents (S2+S4): {pts13} pts</span>
        {trumpSuit && <span style={{ fontWeight: "bold" }}>Trump: {trumpSuit}</span>}
      </div>

      {phase === "bidding" && (
        <div className="belote-turnup">
          <span>Turn-up: </span>
          {cardEl(turnUpCard)}
          <span style={{ color: isRed(turnUpCard.suit) ? "#c62828" : "#333" }}>{turnUpCard.suit}</span>
        </div>
      )}

      <div className="belote-message">{message}</div>

      {phase === "bidding" && (
        <div className="belote-bid-btns">
          <button data-testid="hint-target-belote-primary" className="belote-btn" onClick={() => dispatch({ type: "accept" } as BeloteAction)}>
            Accept {turnUpCard.suit} as trump
          </button>
          <button className="belote-btn pass" onClick={() => dispatch({ type: "pass" } as BeloteAction)}>
            Pass
          </button>
        </div>
      )}

      <div className="belote-trick">
        {currentTrick.length === 0
          ? <span className="belote-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="belote-label">{seat === 0 ? "You" : `S${seat + 1}`}</div>
              {cardEl(card)}
            </div>
          ))}
      </div>

      {(phase === "playing" || phase === "done") && (
        <>
          <div className="belote-label">Your hand{phase === "playing" ? " — click to play:" : ":"}</div>
          <div className="belote-hand">
            {playerHand.map(card => cardEl(card, phase === "playing"))}
          </div>
        </>
      )}
    </div>
  );
}
