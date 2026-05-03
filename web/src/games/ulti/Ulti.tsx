import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UltiState, UltiSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Ulti.css";

type UltiAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2"];

export function Ulti({ state, dispatch, onGameOver }: GameProps<UltiState, UltiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, bid, declarer, tricks, score, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="ulti">
      <div className="ul-header">
        <span>You: {score[0]} pts</span>
        <span>Bots: {score[1]} pts</span>
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        {phase !== "bidding" && <span>Declarer: {SEAT_NAMES[declarer]} bid {bid}</span>}
      </div>
      <div className="ul-bots-row">
        {[1, 2].map(s => (
          <div key={s} className={`ul-seat${turn === s && !done ? " active" : ""}`}>
            <div className="ul-seat-label">{SEAT_NAMES[s]}</div>
            <div className="ul-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="ul-card-back" />)}
            </div>
            <div className="ul-seat-label">Won: {tricks[s]}</div>
          </div>
        ))}
      </div>
      {phase === "bidding" && turn === 0 && (
        <div className="ul-bid-area">
          <div className="ul-label">Bid tricks (1-10):</div>
          <div className="ul-bid-buttons">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
              <button data-testid="hint-target-ulti-primary" key={i} className="ul-btn" onClick={() => dispatch({ type: "bid", amount: i } as UltiAction)}>{i}</button>
            ))}
          </div>
        </div>
      )}
      {phase === "playing" && (
        <div className="ul-trick-area">
          <div className="ul-label">Current Trick</div>
          <div className="ul-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4 }}>—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="ul-trick-slot">
                  <div className="ul-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="ul-status">{message}</div>
      <div className="ul-player-area">
        <div className="ul-player-label">Your Hand — Won: {tricks[0]}</div>
        <div className="ul-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as UltiAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="ul-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
        </div>
      )}
    </div>
  );
}
