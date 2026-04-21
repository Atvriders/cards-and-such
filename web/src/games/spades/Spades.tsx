import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpadesState, SpadesSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Spades.css";

type SpadesAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2 (Partner)", "Bot 3"];

export function Spades({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpadesState, SpadesSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, bids, tricks, currentTrick, turn, phase, teamScore, teamBags, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0)
      ? legalPlays(state, 0).map(c => c.id)
      : []
  );

  return (
    <div className="spades">
      {/* Header */}
      <div className="spades-header">
        <span>Your Team: {teamScore[0]} pts ({teamBags[0]} bags)</span>
        <span>Bots Team: {teamScore[1]} pts ({teamBags[1]} bags)</span>
        {bids[0] !== null && <span>Your bid: {bids[0]} | Tricks: {tricks[0]}</span>}
      </div>

      {/* Bot seats */}
      <div className="spades-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`spades-seat${turn === s && !done ? " active" : ""}`}>
            <div className="spades-seat-label">{SEAT_NAMES[s]}</div>
            <div className="spades-card-backs">
              {hands[s]!.slice(0, 5).map((_, i) => <div key={i} className="spades-card-back" />)}
              {hands[s]!.length > 5 && <span style={{ fontSize: "0.7rem" }}>+{hands[s]!.length - 5}</span>}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
              Bid: {bids[s] ?? "?"} | Won: {tricks[s]}
            </div>
          </div>
        ))}
      </div>

      {/* Current trick */}
      <div className="spades-trick-area">
        <div className="spades-trick-label">Current Trick</div>
        <div className="spades-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="spades-trick-slot">
                <div className="spades-trick-slot-label">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))
          }
        </div>
      </div>

      {/* Status */}
      <div className="spades-status">{message}</div>

      {/* Bidding */}
      {phase === "bidding" && turn === 0 && (
        <div className="spades-bid-area">
          <div className="spades-bid-label">Your bid (0 = Nil bid)</div>
          <div className="spades-bid-buttons">
            {Array.from({ length: 14 }, (_, i) => (
              <button
                key={i}
                className="spades-bid-btn"
                onClick={() => dispatch({ type: "bid", amount: i } as SpadesAction)}
              >
                {i === 0 ? "Nil" : String(i)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player hand */}
      <div className="spades-player-area">
        <div className="spades-player-label">
          Your Hand ({hands[0]!.length} cards) {bids[0] !== null ? `— Bid: ${bids[0]}, Tricks: ${tricks[0]}` : ""}
        </div>
        <div className="spades-player-hand">
          {[...hands[0]!]
            .sort((a, b) => {
              const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
              const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map(card => {
              const legal = legalIds.has(card.id);
              return legal
                ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SpadesAction)} />
                : <Card key={card.id} card={card} className="dim" />;
            })}
        </div>
      </div>

      {/* Result */}
      {done && (
        <div className="spades-result">
          <h2>Hand Complete</h2>
          <div>{message}</div>
          <div>
            {[0, 1, 2, 3].map(s => (
              <div key={s}>
                {SEAT_NAMES[s]}: Bid {bids[s]} — Won {tricks[s]} tricks
              </div>
            ))}
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            Your team score: <strong>{teamScore[0]}</strong> |
            Bot team score: <strong>{teamScore[1]}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
