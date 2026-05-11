import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonCardState, NapoleonCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./NapoleonCard.css";

type NapoleonAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2", "Bot 3"];

export function NapoleonCard({ state, dispatch, onGameOver }: GameProps<NapoleonCardState, NapoleonCardSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trump, trick, turn, phase, tricksWon, score, message } = state;
  const trumpSuit = trump ?? "♥";
  const currentTrick = trick ?? [];
  const tricks = tricksWon ?? [0, 0, 0, 0];
  const bid = 0;
  const declarer = 0;
  const bidPhase = false;
  const done = phase === "done";
  const playerHand = hands[0] ?? [];
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(playerHand, currentTrick).map((c: CardType) => c.id) : []
  );

  return (
    <div className="napoleon-card">
      <div className="nap-header">
        <span>You: {score[0]} pts</span>
        <span>Bots: {score[1]} pts</span>
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        {!bidPhase && <span>Declarer: {SEAT_NAMES[declarer]} (bid {bid})</span>}
      </div>

      <div className="nap-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`nap-seat${turn === s && !done ? " active" : ""}`}>
            <div className="nap-seat-label">{SEAT_NAMES[s]}</div>
            <div className="nap-card-backs">
              {(hands[s] ?? []).map((_: CardType, i: number) => <div key={i} className="nap-card-back" />)}
            </div>
            <div className="nap-seat-label">Won: {tricks[s] ?? 0}</div>
          </div>
        ))}
      </div>

      {bidPhase && turn === 0 && (
        <div className="nap-bid-area">
          <div className="nap-label">Your bid (0=pass, 2-5 tricks):</div>
          <div className="nap-bid-buttons">
            {[0, 2, 3, 4, 5].map(i => (
              <button key={i} className="nap-btn" onClick={() => dispatch({ type: "bid", amount: i } as NapoleonAction)}>
                {i === 0 ? "Pass" : i}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="nap-trick-area">
          <div className="nap-label">Current Trick</div>
          <div className="nap-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4 }}>—</span>
              : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
                <div key={card.id} className="nap-trick-slot">
                  <div className="nap-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="nap-status">{message}</div>

      <div className="nap-player-area">
        <div className="nap-player-label">Your Hand — Tricks: {tricks[0] ?? 0}</div>
        <div className="nap-player-hand">
          {playerHand.map((card: CardType) => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as NapoleonAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {done && (
        <div className="nap-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{score[0]}</strong></div>
        </div>
      )}
    </div>
  );
}
