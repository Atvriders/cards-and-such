import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BourreState, BourreSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Bourre.css";

type BourreAction =
  | { type: "fold" }
  | { type: "stay" }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Bourre({
  state,
  dispatch,
  onGameOver,
}: GameProps<BourreState, BourreSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpCard, trumpSuit, currentTrick, turn, phase, folded, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="bourre">
      <div className="br-header">
        <span>You: {score[0]}</span>
        <span>Bots: {score[1]}</span>
        <span>Trump: {trumpSuit}</span>
        <span>Pot: 10</span>
      </div>

      <div className="br-trump-card">
        <div className="br-label">Trump Card</div>
        <Card card={trumpCard} />
      </div>

      <div className="br-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`br-seat${folded[s] ? " folded" : ""}${turn === s && !done ? " active" : ""}`}>
            <div className="br-seat-label">{SEAT_NAMES[s]}{folded[s] ? " (folded)" : ""}</div>
            <div className="br-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="br-card-back" />)}
            </div>
            <div className="br-seat-info">Tricks: {tricks[s]}</div>
          </div>
        ))}
      </div>

      {phase === "fold-or-play" && turn === 0 && (
        <div className="br-fold-area">
          <div className="br-label">Stay in or fold?</div>
          <div className="br-fold-buttons">
            <button data-testid="hint-target-bourre-stay" className="br-btn stay" onClick={() => dispatch({ type: "stay" } as BourreAction)}>
              Stay In
            </button>
            <button data-testid="hint-target-bourre-fold" className="br-btn fold" onClick={() => dispatch({ type: "fold" } as BourreAction)}>
              Fold
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="br-trick-area">
          <div className="br-label">Current Trick</div>
          <div className="br-trick-cards">
            {currentTrick.length === 0
              ? <span className="br-empty">—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="br-trick-slot">
                  <div className="br-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="br-status">{message}</div>

      {!folded[0] && (
        <div className="br-player-area">
          <div className="br-player-label">Your Hand — Tricks: {tricks[0]}</div>
          <div className="br-player-hand">
            {hands[0]!.map(card => {
              const legal = legalIds.has(card.id);
              return legal
                ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BourreAction)} />
                : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
            })}
          </div>
        </div>
      )}

      {done && (
        <div className="br-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
          <div>Bot score: <strong>{score[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
