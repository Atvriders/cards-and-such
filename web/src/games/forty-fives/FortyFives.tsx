import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortyFivesState, FortyFivesSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FortyFives.css";

type FortyFivesAction = { type: "play"; cardId: string };
const SEAT_NAMES = ["You", "Bot 1", "Bot 2 (Partner)", "Bot 3"];

export function FortyFives({
  state,
  dispatch,
  onGameOver,
}: GameProps<FortyFivesState, FortyFivesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="forty-fives">
      <div className="ff-header">
        <span>Your Team: {score[0]} pts</span>
        <span>Bot Team: {score[1]} pts</span>
        <span>Trump: {trumpSuit}</span>
        <span>Goal: 45</span>
      </div>

      <div className="ff-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`ff-seat${turn === s && !done ? " active" : ""}${s === 2 ? " partner" : ""}`}>
            <div className="ff-seat-label">{SEAT_NAMES[s]}</div>
            <div className="ff-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="ff-card-back" />)}
            </div>
            <div className="ff-seat-info">Tricks: {tricks[s]}</div>
          </div>
        ))}
      </div>

      <div className="ff-trick-area">
        <div className="ff-label">Current Trick</div>
        <div className="ff-trick-cards">
          {currentTrick.length === 0
            ? <span className="ff-empty">—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="ff-trick-slot">
                <div className="ff-trick-name">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>

      <div className="ff-status">{message}</div>

      <div className="ff-player-area">
        <div className="ff-player-label">Your Hand — Tricks: {tricks[0]}</div>
        <div data-testid="hint-target-forty-fives-hand" className="ff-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as FortyFivesAction)} />
              : <Card key={card.id} card={card} className="dim" />;
          })}
        </div>
      </div>

      {done && (
        <div className="ff-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>Your team: <strong>{score[0]} pts</strong></div>
          <div>Bot team: <strong>{score[1]} pts</strong></div>
        </div>
      )}
    </div>
  );
}
