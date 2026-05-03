import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SchafkopfState, SchafkopfSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Schafkopf.css";

type SchafkopfAction = { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Schafkopf({
  state,
  dispatch,
  onGameOver,
}: GameProps<SchafkopfState, SchafkopfSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, phase, tricks, points, score, message } = state;
  const done = phase === "done";

  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="schafkopf">
      <div className="sk-header">
        <span>You: {score[0]} wins</span>
        <span>Bots: {score[1]} wins</span>
        <span>Trump: ♥ + Queens/Jacks</span>
      </div>

      <div className="sk-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`sk-seat${turn === s && !done ? " active" : ""}`}>
            <div className="sk-seat-label">{SEAT_NAMES[s]}</div>
            <div className="sk-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="sk-card-back" />)}
            </div>
            <div className="sk-seat-info">Tricks: {tricks[s]} | Pts: {points[s]}</div>
          </div>
        ))}
      </div>

      <div className="sk-trick-area">
        <div className="sk-trick-label">Current Trick</div>
        <div className="sk-trick-cards">
          {currentTrick.length === 0
            ? <span className="sk-empty">—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="sk-trick-slot">
                <div className="sk-trick-name">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>

      <div className="sk-status">{message}</div>

      <div className="sk-player-area">
        <div className="sk-player-label">
          Your Hand — Tricks: {tricks[0]} | Card-Points: {points[0]}
        </div>
        <div data-testid="hint-target-schafkopf-hand" className="sk-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SchafkopfAction)} />
              : <Card key={card.id} card={card} className="dim" />;
          })}
        </div>
      </div>

      {done && (
        <div className="sk-result">
          <h2>Hand Over</h2>
          <div>{message}</div>
          <div>Your card-points: <strong>{points[0]}</strong></div>
          <div>Bot card-points: <strong>{points[1]! + points[2]! + points[3]!}</strong></div>
        </div>
      )}
    </div>
  );
}
