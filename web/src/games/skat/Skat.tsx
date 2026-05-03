import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkatState, SkatTrump } from "./state.js";
import { isTerminal, isTrump } from "./state.js";
import "./Skat.css";

type SkatAction =
  | { type: "bid"; bid: number }
  | { type: "pickup"; take: boolean }
  | { type: "discard"; cardId: string }
  | { type: "setTrump"; trump: SkatTrump }
  | { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

export function Skat({ state, dispatch, onGameOver }: GameProps<SkatState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [discards, setDiscards] = useState<string[]>([]);

  const { hands, skat, trump, phase, currentTrick, wonCards, message, declarer } = state;
  const playerHand = hands[0]!;

  const cardEl = (card: { suit: string; rank: number; id: string }, clickable = false, selected = false) => {
    const tr = trump && isTrump(card as never, trump);
    const isJack = card.rank === 11;
    return (
      <div key={card.id}
        className={`skat-card${tr ? " trump" : ""}${isJack ? " jack" : ""}${selected ? " selected" : ""}`}
        style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: clickable ? "pointer" : "default" }}
        onClick={clickable ? () => dispatch({ type: "play", cardId: card.id } as SkatAction) : undefined}
      >
        {card.suit}{rankLabel(card.rank)}
      </div>
    );
  };

  return (
    <div className="skat">
      <div className="skat-header">
        <span>You: {wonCards[0]!.reduce((s, c) => s + (c.rank === 1 ? 11 : c.rank === 10 ? 10 : c.rank === 13 ? 4 : c.rank === 12 ? 3 : c.rank === 11 ? 2 : 0), 0)} pts</span>
        <span>Seat 2: {wonCards[1]!.reduce((s, c) => s + (c.rank === 1 ? 11 : c.rank === 10 ? 10 : c.rank === 13 ? 4 : c.rank === 12 ? 3 : c.rank === 11 ? 2 : 0), 0)} pts</span>
        <span>Seat 3: {wonCards[2]!.reduce((s, c) => s + (c.rank === 1 ? 11 : c.rank === 10 ? 10 : c.rank === 13 ? 4 : c.rank === 12 ? 3 : c.rank === 11 ? 2 : 0), 0)} pts</span>
        {trump && <span style={{ fontWeight: "bold" }}>Trump: {trump === "grand" ? "Grand" : trump}</span>}
        {declarer >= 0 && <span>Declarer: {declarer === 0 ? "You" : `Seat ${declarer + 1}`}</span>}
      </div>

      <div className="skat-message">{message}</div>

      {phase === "bidding" && (
        <div className="skat-bid-btns">
          <button data-testid="hint-target-skat-primary" className="skat-btn" onClick={() => dispatch({ type: "bid", bid: 18 } as SkatAction)}>Bid 18</button>
          <button className="skat-btn" onClick={() => dispatch({ type: "bid", bid: 20 } as SkatAction)}>Bid 20</button>
          <button className="skat-btn" onClick={() => dispatch({ type: "bid", bid: 22 } as SkatAction)}>Bid 22</button>
          <button className="skat-btn pass" onClick={() => dispatch({ type: "bid", bid: 0 } as SkatAction)}>Pass</button>
        </div>
      )}

      {phase === "pickup" && (
        <div className="skat-bid-btns">
          <div className="skat-skat">
            <span>Skat: </span>
            {skat.map(c => cardEl(c))}
          </div>
          <button className="skat-btn" onClick={() => dispatch({ type: "pickup", take: true } as SkatAction)}>Pick up Skat</button>
          <button className="skat-btn pass" onClick={() => dispatch({ type: "pickup", take: false } as SkatAction)}>Play without Skat</button>
        </div>
      )}

      {phase === "declare" && (
        <div className="skat-section">
          {playerHand.length > 10 && (
            <>
              <div className="skat-label">Click 2 cards to discard:</div>
              <div className="skat-hand">
                {playerHand.map(card => (
                  <div key={card.id}
                    className={`skat-card${discards.includes(card.id) ? " selected" : ""}`}
                    style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "pointer" }}
                    onClick={() => {
                      const next = discards.includes(card.id)
                        ? discards.filter(id => id !== card.id)
                        : discards.length < 2 ? [...discards, card.id] : discards;
                      setDiscards(next);
                      if (next.length === 2 && !discards.includes(card.id)) {
                        // Discard them one by one
                        const toDiscard = next.includes(card.id) ? next : [...next, card.id];
                        toDiscard.forEach(id => dispatch({ type: "discard", cardId: id } as SkatAction));
                        setDiscards([]);
                      } else if (!discards.includes(card.id) && discards.length === 1) {
                        dispatch({ type: "discard", cardId: discards[0]! } as SkatAction);
                        dispatch({ type: "discard", cardId: card.id } as SkatAction);
                        setDiscards([]);
                      }
                    }}
                  >
                    {card.suit}{rankLabel(card.rank)}
                  </div>
                ))}
              </div>
            </>
          )}
          {playerHand.length <= 10 && (
            <>
              <div className="skat-label">Choose trump suit:</div>
              <div className="skat-trump-btns">
                {(["♣", "♠", "♥", "♦"] as const).map(s => (
                  <button key={s} className="skat-trump-btn" style={{ color: isRed(s) ? "#c62828" : "#333" }}
                    onClick={() => dispatch({ type: "setTrump", trump: s } as SkatAction)}>{s}</button>
                ))}
                <button className="skat-trump-btn" onClick={() => dispatch({ type: "setTrump", trump: "grand" } as SkatAction)}>Grand</button>
              </div>
            </>
          )}
          <div className="skat-hand">{playerHand.map(c => cardEl(c))}</div>
        </div>
      )}

      {(phase === "playing" || phase === "done") && (
        <>
          <div className="skat-trick">
            {currentTrick.length === 0
              ? <span className="skat-label">— trick area —</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} style={{ textAlign: "center" }}>
                  <div className="skat-label">{seat === 0 ? "You" : `Seat ${seat + 1}`}</div>
                  {cardEl(card)}
                </div>
              ))}
          </div>
          {phase === "playing" && (
            <>
              <div className="skat-label">Your hand — click to play:</div>
              <div className="skat-hand">{playerHand.map(c => cardEl(c, true))}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
