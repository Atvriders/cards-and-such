import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EuchreState, EuchreSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Suit } from "../../engines/deck/index.js";
import "./Euchre.css";

type EuchreAction =
  | { type: "order-up" }
  | { type: "pass" }
  | { type: "name-suit"; suit: Suit }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2 (Partner)", "Bot 3"];
const ALL_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function Euchre({
  state,
  dispatch,
  onGameOver,
}: GameProps<EuchreState, EuchreSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, upCard, trumpSuit, currentTrick, turn, phase, tricks, score, message, makerSeat } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0)
      ? legalPlays(state, 0).map(c => c.id)
      : []
  );

  return (
    <div className="euchre">
      {/* Header */}
      <div className="euchre-header">
        <span>Your Team: {score[0]} pts</span>
        <span>Bot Team: {score[1]} pts</span>
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        {makerSeat !== null && <span>Maker: {SEAT_NAMES[makerSeat]}</span>}
      </div>

      {/* Bot hands */}
      <div className="euchre-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`euchre-seat${turn === s && !done ? " active" : ""}`}>
            <div className="euchre-seat-label">{SEAT_NAMES[s]}</div>
            <div className="euchre-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="euchre-card-back" />)}
            </div>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Tricks: {tricks[s]}</div>
          </div>
        ))}
      </div>

      {/* Up card */}
      {phase !== "playing" && (
        <div className="euchre-upcard-area">
          <div>
            <div className="euchre-upcard-label">Up Card</div>
            <Card card={upCard} />
          </div>
        </div>
      )}

      {/* Trump selection actions */}
      {phase === "trump-select-1" && turn === 0 && (
        <div className="euchre-trump-actions">
          <button className="euchre-btn" onClick={() => dispatch({ type: "order-up" } as EuchreAction)}>
            Order Up {upCard.suit}
          </button>
          <button className="euchre-btn" onClick={() => dispatch({ type: "pass" } as EuchreAction)}>
            Pass
          </button>
        </div>
      )}

      {phase === "trump-select-2" && turn === 0 && (
        <div className="euchre-trump-actions">
          {ALL_SUITS.filter(s => s !== upCard.suit).map(s => (
            <button
              key={s}
              className="euchre-btn suit"
              onClick={() => dispatch({ type: "name-suit", suit: s } as EuchreAction)}
            >
              Name {s}
            </button>
          ))}
          <button className="euchre-btn" onClick={() => dispatch({ type: "pass" } as EuchreAction)}>
            Pass
          </button>
        </div>
      )}

      {/* Current trick */}
      {phase === "playing" && (
        <div className="euchre-trick-area">
          <div className="euchre-trick-label">Current Trick</div>
          <div className="euchre-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="euchre-trick-slot">
                  <div className="euchre-trick-slot-label">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Status */}
      <div className="euchre-status">{message}</div>

      {/* Player hand */}
      <div className="euchre-player-area">
        <div className="euchre-player-label">
          Your Hand — Tricks: {tricks[0]}
        </div>
        <div className="euchre-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as EuchreAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {/* Result */}
      {done && (
        <div className="euchre-result">
          <h2>Hand Complete</h2>
          <div>{message}</div>
          <div>Your team: <strong>{score[0]} pts</strong></div>
          <div>Bot team: <strong>{score[1]} pts</strong></div>
          <div style={{ marginTop: "0.5rem" }}>Tricks — {SEAT_NAMES.map((n, i) => `${n}: ${tricks[i]}`).join(" | ")}</div>
        </div>
      )}
    </div>
  );
}
