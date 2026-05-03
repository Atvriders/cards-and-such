import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OhHellState, OhHellSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./OhHell.css";

type OhHellAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];
const HAND_SIZE = 7;

export function OhHell({
  state,
  dispatch,
  onGameOver,
}: GameProps<OhHellState, OhHellSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpCard, trumpSuit, currentTrick, turn, phase, bids, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="oh-hell">
      <div className="oh-header">
        <span>You: {score[0]} pts</span>
        <span>Bots: {score[1]} pts</span>
        <span>Trump: {trumpSuit}</span>
      </div>

      <div className="oh-trump-card">
        <div className="oh-label">Trump Card</div>
        <Card card={trumpCard} />
      </div>

      <div className="oh-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`oh-seat${turn === s && !done ? " active" : ""}`}>
            <div className="oh-seat-label">{SEAT_NAMES[s]}</div>
            <div className="oh-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="oh-card-back" />)}
            </div>
            <div className="oh-seat-info">
              Bid: {bids[s] ?? "?"} | Won: {tricks[s]}
            </div>
          </div>
        ))}
      </div>

      {phase === "bidding" && turn === 0 && (
        <div className="oh-bid-area">
          <div className="oh-label">Your bid (0–{HAND_SIZE}):</div>
          <div className="oh-bid-buttons">
            {Array.from({ length: HAND_SIZE + 1 }, (_, i) => (
              <button data-testid="hint-target-oh-hell-primary" key={i} className="oh-btn" onClick={() => dispatch({ type: "bid", amount: i } as OhHellAction)}>
                {i}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="oh-trick-area">
          <div className="oh-label">Current Trick</div>
          <div className="oh-trick-cards">
            {currentTrick.length === 0
              ? <span className="oh-empty">—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="oh-trick-slot">
                  <div className="oh-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="oh-status">{message}</div>

      <div className="oh-player-area">
        <div className="oh-player-label">
          Your Hand — Bid: {bids[0] ?? "?"} | Won: {tricks[0]}
        </div>
        <div className="oh-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as OhHellAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {done && (
        <div className="oh-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
          <div>Bot score: <strong>{score[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
