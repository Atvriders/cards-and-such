import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TarockState, TarockSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Tarock.css";

type TarockAction = { type: "play"; cardId: string };
const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Tarock({ state, dispatch, onGameOver }: GameProps<TarockState, TarockSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, tricksWon, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="tarock">
      <div className="tk-header">
        <span>You: {score[0]} pts</span>
        <span>Bots: {score[1]} pts</span>
        <span>Trump: {trumpSuit}</span>
      </div>
      <div className="tk-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`tk-seat${turn === s && !done ? " active" : ""}`}>
            <div className="tk-seat-label">{SEAT_NAMES[s]}</div>
            <div className="tk-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="tk-card-back" />)}
            </div>
            <div className="tk-seat-label">Tricks: {tricksWon[s]}</div>
          </div>
        ))}
      </div>
      <div className="tk-trick-area">
        <div className="tk-label">Current Trick</div>
        <div className="tk-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="tk-trick-slot">
                <div className="tk-trick-name">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="tk-status">{message}</div>
      <div className="tk-player-area">
        <div className="tk-player-label">Your Hand — Tricks: {tricksWon[0]}</div>
        <div className="tk-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as TarockAction)} />
              : <Card key={card.id} card={card} className={turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="tk-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
        </div>
      )}
    </div>
  );
}
