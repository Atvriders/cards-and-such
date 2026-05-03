import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TwentyNineState } from "./state.js";
import { legalPlays, isTerminal, cardPoints } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./TwentyNine.css";

type TwentyNineAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2 (partner)", "Bot 3"];

export function TwentyNine({ state, dispatch, onGameOver }: GameProps<TwentyNineState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const [bidAmount, setBidAmount] = useState(15);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, tricksTaken, pointsTaken, tricksPlayed, bid, bidTeam, trumpSuit, trumpRevealed, finalScores, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (phase === "playing" && !done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="twentynine">
      <div className="tn-header">
        <span>Twenty-Nine (29)</span>
        {phase !== "bidding" && <span>Trump: {trumpRevealed ? trumpSuit : "hidden"}</span>}
        {phase !== "bidding" && <span>Bid: {bid} (team {bidTeam})</span>}
        {phase !== "bidding" && <span>Tricks: {tricksPlayed}/8</span>}
        {phase !== "bidding" && <span>Pts: {pointsTaken[0]} / {pointsTaken[1]}</span>}
      </div>

      {phase === "bidding" && (
        <div className="tn-bid-panel">
          <div className="tn-bid-label">Enter your bid (15–28) or 0 to pass</div>
          <div className="tn-bid-controls">
            <input
              type="number"
              className="tn-bid-input"
              value={bidAmount}
              min={0}
              max={28}
              onChange={e => setBidAmount(Number(e.target.value))}
            />
            <button data-testid="hint-target-twenty-nine-action"
              className="tn-btn"
              onClick={() => dispatch({ type: "bid", amount: bidAmount } as TwentyNineAction)}
            >
              Bid {bidAmount > 0 ? bidAmount : "(Pass)"}
            </button>
          </div>
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Your hand point value: {hands[0]!.reduce((s, c) => s + cardPoints(c), 0)} raw pts
          </div>
        </div>
      )}

      {phase !== "bidding" && (
        <>
          <div className="tn-bots-row">
            {[1, 2, 3].map(s => (
              <div key={s} className={`tn-seat${turn === s && !done ? " active" : ""}`}>
                <div className="tn-seat-label">{SEAT_NAMES[s]}</div>
                <div className="tn-card-backs">
                  {Array.from({ length: hands[s]!.length }).map((_, i) => (
                    <div key={i} className="tn-card-back" />
                  ))}
                </div>
                <div className="tn-tricks-badge">{tricksTaken[s % 2]} team tricks</div>
              </div>
            ))}
          </div>

          <div className="tn-trick-area">
            <div className="tn-trick-label">
              Trick {tricksPlayed + 1}
              {currentTrick.length > 0 ? ` (led: ${rankLabel(currentTrick[0]!.card.rank)}${currentTrick[0]!.card.suit})` : ""}
            </div>
            <div className="tn-trick-cards">
              {currentTrick.length === 0 ? (
                <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
              ) : (
                currentTrick.map(({ seat, card }) => (
                  <div key={card.id} className="tn-trick-slot">
                    <div className="tn-trick-slot-label">{SEAT_NAMES[seat]}</div>
                    <Card card={card} />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="tn-status">{message}</div>

      {phase === "playing" && (
        <div className="tn-player-area">
          <div className="tn-player-label">
            Your Hand ({hands[0]!.length} cards) — Your team pts: {pointsTaken[0]}
          </div>
          <div className="tn-player-hand">
            {hands[0]!
              .slice()
              .sort((a, b) => {
                const so: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
                const sd = (so[a.suit] ?? 0) - (so[b.suit] ?? 0);
                return sd !== 0 ? sd : a.rank - b.rank;
              })
              .map(card => {
                const legal = legalIds.has(card.id);
                const pts = cardPoints(card);
                return (
                  <div key={card.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {legal ? (
                      <Card
                        card={card}
                        onClick={() => dispatch({ type: "play", cardId: card.id } as TwentyNineAction)}
                      />
                    ) : (
                      <Card card={card} className="dim" />
                    )}
                    {pts > 0 && <span style={{ fontSize: "0.65rem", color: "#ffe082" }}>{pts}pt</span>}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {done && finalScores && (
        <div className="tn-result">
          <h2>{terminal?.score === 100 ? "Your Team Wins!" : "Bot Team Wins."}</h2>
          <div>Team 0 (You+Bot2): {finalScores[0]} pts</div>
          <div>Team 1 (Bot1+Bot3): {finalScores[1]} pts</div>
          <div>Bid: {bid} by team {bidTeam}</div>
          <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>
            Bid team {bidTeam === 0 ? "made" : "needed"} {bid} pts to win.
          </div>
        </div>
      )}
    </div>
  );
}
