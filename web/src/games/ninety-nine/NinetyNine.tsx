import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NinetyNineState, NinetyNineSettings } from "./state.js";
import { legalPlays, isTerminal, bidValue } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./NinetyNine.css";

type NinetyNineAction =
  | { type: "putDown"; cardIds: [string, string, string] }
  | { type: "play"; cardId: string };

export function NinetyNine({ state, dispatch, onGameOver }: GameProps<NinetyNineState, NinetyNineSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Reset selection when phase changes
  useEffect(() => {
    if (state.phase !== "bidding") setSelectedIds([]);
  }, [state.phase]);

  const { hands, currentTrick, turn, phase, trumpSuit, bids, tricksTaken, tricksPlayed, finalScores } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (phase === "playing" && !done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  const toggleBidCard = (cardId: string) => {
    if (phase !== "bidding") return;
    setSelectedIds(prev => {
      if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, cardId];
    });
  };

  const confirmBid = () => {
    if (selectedIds.length !== 3) return;
    dispatch({ type: "putDown", cardIds: selectedIds as [string, string, string] } as NinetyNineAction);
  };

  const bidTotal = selectedIds.reduce((sum, id) => {
    const card = hands[0]!.find(c => c.id === id);
    return sum + (card ? bidValue(card) : 0);
  }, 0);

  let statusLine = "";
  if (done) statusLine = "Hand complete!";
  else if (phase === "bidding") statusLine = "Select 3 cards to put down (their suits = your bid). ♣=3 ♥=2 ♠=1 ♦=0";
  else if (turn === 0) statusLine = currentTrick.length === 0 ? `Your lead (trump: ${trumpSuit})` : "Your turn";
  else statusLine = `Waiting on ${seatName(turn)}…`;

  return (
    <div className="ninetynine">
      <div className="ninetynine-header">
        <span>Trump: {trumpSuit}</span>
        <span>Tricks: {tricksPlayed}/9</span>
        {bids.map((b, i) => b !== null ? (
          <span key={i}>{seatName(i)}: bid {b}, got {tricksTaken[i]}</span>
        ) : null)}
      </div>

      <div className="ninetynine-bots-row">
        {[1, 2].map(s => (
          <div key={s} className={`ninetynine-seat${turn === s && !done ? " active" : ""}`}>
            <div className="ninetynine-seat-label">{seatName(s)}</div>
            <div className="ninetynine-card-backs">
              {Array.from({ length: hands[s]!.length }).map((_, i) => (
                <div key={i} className="ninetynine-card-back" />
              ))}
            </div>
            <div className="ninetynine-bid-badge">
              {bids[s] !== null ? `Bid: ${bids[s]} | Got: ${tricksTaken[s]}` : "Bidding…"}
            </div>
          </div>
        ))}
      </div>

      {phase === "bidding" && (
        <div className="ninetynine-bid-phase">
          <h3>Select 3 cards to put face-down (your bid)</h3>
          <p>♣=3 ♥=2 ♠=1 ♦=0. Sum of suits = number of tricks you'll win.</p>
          <div className="ninetynine-selected-info">
            Selected {selectedIds.length}/3 — Bid total: {bidTotal} tricks
          </div>
          <div className="ninetynine-player-hand" style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "center" }}>
            {hands[0]!
              .slice()
              .sort((a, b) => {
                const suitOrder = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
                const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
                return sd !== 0 ? sd : a.rank - b.rank;
              })
              .map(card => (
                <Card
                  key={card.id}
                  card={card}
                  className={selectedIds.includes(card.id) ? "selected" : ""}
                  onClick={() => toggleBidCard(card.id)}
                />
              ))}
          </div>
          <button
            className="ninetynine-confirm-btn"
            disabled={selectedIds.length !== 3}
            onClick={confirmBid}
          >
            Confirm Bid ({bidTotal} tricks)
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="ninetynine-trick-area">
            <div className="ninetynine-trick-label">
              Current Trick {currentTrick.length > 0 ? `(led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
            </div>
            <div className="ninetynine-trick-cards">
              {currentTrick.length === 0 ? (
                <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
              ) : (
                currentTrick.map(({ seat, card }) => (
                  <div key={card.id} className="ninetynine-trick-slot">
                    <div className="ninetynine-trick-slot-label">{seatName(seat)}</div>
                    <Card card={card} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="ninetynine-status">{statusLine}</div>

          <div className="ninetynine-player-area">
            <div className="ninetynine-player-label">
              Your Hand ({hands[0]!.length} cards) — Bid: {bids[0] ?? "?"} | Got: {tricksTaken[0]}
            </div>
            <div className="ninetynine-player-hand">
              {hands[0]!
                .slice()
                .sort((a, b) => {
                  const suitOrder = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
                  const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
                  return sd !== 0 ? sd : a.rank - b.rank;
                })
                .map(card => {
                  const legal = legalIds.has(card.id);
                  return legal ? (
                    <Card
                      key={card.id}
                      card={card}
                      className=""
                      onClick={() => dispatch({ type: "play", cardId: card.id } as NinetyNineAction)}
                    />
                  ) : (
                    <Card
                      key={card.id}
                      card={card}
                      className="dim"
                    />
                  );
                })}
            </div>
          </div>
        </>
      )}

      {phase === "bidding" && (
        <div className="ninetynine-status">{statusLine}</div>
      )}

      {done && finalScores && (
        <div className="ninetynine-result">
          <h2>Hand Over</h2>
          <div className="ninetynine-scores-row">
            {[0, 1, 2].map(s => (
              <div key={s} className="ninetynine-score-box">
                {seatName(s)}: bid {bids[s]}, got {tricksTaken[s]}, {finalScores[s]! >= 10 ? "Made! +10" : "Missed -5"}
              </div>
            ))}
          </div>
          <div><strong>{finalScores[0]! >= 10 ? "You made your bid!" : "You missed your bid."}</strong></div>
        </div>
      )}
    </div>
  );
}
