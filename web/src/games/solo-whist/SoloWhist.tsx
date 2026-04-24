import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoloWhistState, SoloWhistSettings, SoloBid } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./SoloWhist.css";

type SoloWhistAction =
  | { type: "bid"; bid: SoloBid }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
const BIDS: SoloBid[] = ["solo", "misere", "abundance", "pass"];
const BID_LABELS: Record<SoloBid, string> = {
  solo: "Solo (≥5)",
  misere: "Misere (0)",
  abundance: "Abundance (≥9)",
  pass: "Pass",
};

export function SoloWhist({
  state,
  dispatch,
  onGameOver,
}: GameProps<SoloWhistState, SoloWhistSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, playerBid, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="solo-whist">
      <div className="sw-header">
        <span>You: {score[0]} wins</span>
        <span>Bots: {score[1]} wins</span>
        <span>Trump: {trumpSuit}</span>
        {playerBid && <span>Bid: {BID_LABELS[playerBid]}</span>}
      </div>

      <div className="sw-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`sw-seat${turn === s && !done ? " active" : ""}`}>
            <div className="sw-seat-label">{SEAT_NAMES[s]}</div>
            <div className="sw-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="sw-card-back" />)}
            </div>
            <div className="sw-seat-info">Tricks: {tricks[s]}</div>
          </div>
        ))}
      </div>

      {phase === "bidding" && (
        <div className="sw-bid-area">
          <div className="sw-label">Choose your bid:</div>
          <div className="sw-bid-buttons">
            {BIDS.map(b => (
              <button key={b} className={`sw-btn${b === "pass" ? " pass" : ""}`}
                onClick={() => dispatch({ type: "bid", bid: b } as SoloWhistAction)}>
                {BID_LABELS[b]}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="sw-trick-area">
          <div className="sw-label">Current Trick</div>
          <div className="sw-trick-cards">
            {currentTrick.length === 0
              ? <span className="sw-empty">—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="sw-trick-slot">
                  <div className="sw-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="sw-status">{message}</div>

      <div className="sw-player-area">
        <div className="sw-player-label">Your Hand — Tricks: {tricks[0]}</div>
        <div className="sw-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SoloWhistAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {done && (
        <div className="sw-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>Your wins: <strong>{score[0]}</strong></div>
          <div>Bot wins: <strong>{score[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
