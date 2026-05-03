import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlopState, KlopSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Klop.css";

type KlopAction = { type: "play"; cardId: string };
const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Klop({ state, dispatch, onGameOver }: GameProps<KlopState, KlopSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, tricksWon, penalty, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="klop">
      <div className="kl-header">
        <span>Your penalty: {penalty[0] ?? 0}</span>
        <span>Your score: {score[0]}</span>
        <span>No trump — avoid tricks!</span>
      </div>
      <div className="kl-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`kl-seat${turn === s && !done ? " active" : ""}`}>
            <div className="kl-seat-label">{SEAT_NAMES[s]}</div>
            <div className="kl-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="kl-card-back" />)}
            </div>
            <div className="kl-seat-label">Tricks: {tricksWon[s]} Pen: {penalty[s]}</div>
          </div>
        ))}
      </div>
      <div className="kl-trick-area">
        <div className="kl-label">Current Trick</div>
        <div className="kl-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="kl-trick-slot">
                <div className="kl-trick-name">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="kl-status">{message}</div>
      <div className="kl-player-area">
        <div className="kl-player-label">Your Hand — Tricks: {tricksWon[0]}</div>
        <div data-testid="hint-target-klop-hand" className="kl-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as KlopAction)} />
              : <Card key={card.id} card={card} className={turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="kl-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your penalty: <strong>{penalty[0]}</strong> tricks</div>
        </div>
      )}
    </div>
  );
}
