import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SetbackState } from "./state.js";
import { isTerminal, legalPlays } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import "./Setback.css";

type SetbackAction =
  | { type: "bid"; amount: number }
  | { type: "name-trump"; suit: Suit }
  | { type: "play"; cardId: string };

const ALL_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Setback({
  state,
  dispatch,
  onGameOver,
}: GameProps<SetbackState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, bids, highBidder, highBid, trumpSuit, currentTrick, tricksWon, captures, turn, phase, message, scores } = state;
  const done = phase === "done";
  const playerHand = hands[0]!;

  const legalIds = new Set(
    phase === "playing" && turn === 0 && trumpSuit
      ? legalPlays(playerHand, currentTrick, trumpSuit).map(c => c.id)
      : []
  );

  return (
    <div className="setback">
      <div className="setback-header">
        {SEAT_NAMES.map((name, i) => (
          <span key={i}>{name}: {tricksWon[i]} tricks</span>
        ))}
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        {highBidder !== null && <span>Bid: {highBid} by {SEAT_NAMES[highBidder]}</span>}
      </div>

      <div className="setback-bots">
        {[1, 2, 3].map(seat => (
          <div key={seat} className="setback-seat">
            <div className="setback-label">{SEAT_NAMES[seat]} ({hands[seat]!.length})</div>
            <div className="setback-card-backs">
              {hands[seat]!.map((_, i) => <div key={i} className="setback-card-back" />)}
            </div>
          </div>
        ))}
      </div>

      <div className="setback-trick">
        {currentTrick.length === 0
          ? <span className="setback-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="setback-label">{SEAT_NAMES[seat]}</div>
              <div
                className="setback-card"
                style={{ cursor: "default", color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
              >
                {card.suit}{rankLabel(card.rank)}
              </div>
            </div>
          ))}
      </div>

      <div className="setback-message">{message}</div>

      {done && (
        <div className="setback-done">
          {SEAT_NAMES.map((name, i) => (
            <div key={i}>{name}: {scores[i]} pts</div>
          ))}
        </div>
      )}

      {phase === "bidding" && (
        <>
          <div className="setback-label">Your bid:</div>
          <div className="setback-bid-row">
            <button className="setback-bid-btn pass" onClick={() => dispatch({ type: "bid", amount: 0 } as SetbackAction)}>Pass</button>
            <button className="setback-bid-btn" onClick={() => dispatch({ type: "bid", amount: 2 } as SetbackAction)}>2</button>
            <button className="setback-bid-btn" onClick={() => dispatch({ type: "bid", amount: 3 } as SetbackAction)}>3</button>
            <button className="setback-bid-btn" onClick={() => dispatch({ type: "bid", amount: 4 } as SetbackAction)}>4</button>
          </div>
        </>
      )}

      {phase === "name-trump" && (
        <>
          <div className="setback-label">Name your trump suit:</div>
          <div className="setback-suits">
            {ALL_SUITS.map(suit => (
              <button
                key={suit}
                className="setback-suit-btn"
                style={{ color: suit === "♥" || suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "name-trump", suit } as SetbackAction)}
              >
                {suit}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "playing" && turn === 0 && (
        <>
          <div className="setback-label">Your hand — click to play:</div>
          <div className="setback-hand">
            {playerHand.map(card => {
              const legal = legalIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`setback-card${card.suit === trumpSuit ? " trump" : ""}${!legal ? " illegal" : ""}`}
                  style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                  onClick={() => legal && dispatch({ type: "play", cardId: card.id } as SetbackAction)}
                >
                  {card.suit}{rankLabel(card.rank)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
