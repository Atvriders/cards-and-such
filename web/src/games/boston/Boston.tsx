import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BostonState, BostonSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Boston.css";

type BostonAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function Boston({
  state,
  dispatch,
  onGameOver,
}: GameProps<BostonState, BostonSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, bid, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="boston">
      <div className="bt-header">
        <span>You: {score[0]} pts</span>
        <span>Bots: {score[1]} pts</span>
        <span>Trump: {trumpSuit}</span>
        {bid !== null && <span>Bid: {bid}</span>}
      </div>

      <div className="bt-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`bt-seat${turn === s && !done ? " active" : ""}`}>
            <div className="bt-seat-label">{SEAT_NAMES[s]}</div>
            <div className="bt-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="bt-card-back" />)}
            </div>
            <div className="bt-seat-info">Tricks: {tricks[s]}</div>
          </div>
        ))}
      </div>

      {phase === "bidding" && (
        <div className="bt-bid-area">
          <div className="bt-label">Bid (1–13 tricks):</div>
          <div className="bt-bid-buttons">
            {Array.from({ length: 13 }, (_, i) => i + 1).map(n => (
              <button key={n} className="bt-btn"
                onClick={() => dispatch({ type: "bid", amount: n } as BostonAction)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="bt-trick-area">
          <div className="bt-label">Current Trick</div>
          <div className="bt-trick-cards">
            {currentTrick.length === 0
              ? <span className="bt-empty">—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="bt-trick-slot">
                  <div className="bt-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bt-status">{message}</div>

      <div className="bt-player-area">
        <div className="bt-player-label">
          Your Hand — Tricks: {tricks[0]}{bid !== null ? ` / ${bid}` : ""}
        </div>
        <div className="bt-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BostonAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {done && (
        <div className="bt-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
          <div>Bot score: <strong>{score[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
