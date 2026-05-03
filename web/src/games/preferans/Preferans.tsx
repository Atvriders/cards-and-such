import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PrefState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Preferans.css";

type PrefAction =
  | { type: "bid" }
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

export function Preferans({ state, dispatch, onGameOver }: GameProps<PrefState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, talon, trumpSuit, declarer, currentTrick, wonCards, trickCount, phase, message, contractTricks } = state;
  const playerHand = hands[0]!;

  const tricksWon = [0, 1, 2].map(i => wonCards[i]!.length / 3);

  return (
    <div className="preferans">
      <div className="preferans-header">
        <span>Tricks — You: {tricksWon[0]}, S2: {tricksWon[1]}, S3: {tricksWon[2]}</span>
        {declarer !== null && <span>Declarer: {declarer === 0 ? "You" : `Seat ${declarer + 1}`} (contract: {contractTricks})</span>}
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        <span>Trick #{trickCount + 1}/10</span>
      </div>

      <div className="preferans-message">{message}</div>

      {phase === "bidding" && (
        <>
          <div className="preferans-talon">
            <span>Talon: </span>
            {talon.map(c => (
              <div key={c.id} className="preferans-card" style={{ color: isRed(c.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {c.suit}{rankLabel(c.rank)}
              </div>
            ))}
          </div>
          <div className="preferans-bid-btns">
            <button data-testid="hint-target-preferans-primary" className="preferans-btn" onClick={() => dispatch({ type: "bid" } as PrefAction)}>
              Bid (become declarer)
            </button>
            <button className="preferans-btn pass" onClick={() => dispatch({ type: "pass" } as PrefAction)}>
              Pass (defend)
            </button>
          </div>
        </>
      )}

      <div className="preferans-trick">
        {currentTrick.length === 0
          ? <span className="preferans-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="preferans-label">{seat === 0 ? "You" : `S${seat + 1}`}</div>
              <div className={`preferans-card${trumpSuit && isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {card.suit}{rankLabel(card.rank)}
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="preferans-label">Your hand — click to play:</div>
          <div className="preferans-hand">
            {playerHand.map(card => (
              <div key={card.id}
                className={`preferans-card${trumpSuit && isTrump(card, trumpSuit) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as PrefAction)}
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
