import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HokmState, HokmSettings } from "./state.js";
import type { Suit } from "../../engines/deck/index.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Hokm.css";

type HokmAction =
  | { type: "chooseTrump"; suit: Suit }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2*", "Bot 3"];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function Hokm({ state, dispatch, onGameOver }: GameProps<HokmState, HokmSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, tricks, teamTricks, teamScore, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="hokm">
      <div className="hk-header">
        <span>Team 0 (You+Bot2): {teamScore[0]} pts</span>
        <span>Team 1 (Bot1+Bot3): {teamScore[1]} pts</span>
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        <span>Tricks: T0={teamTricks[0]} T1={teamTricks[1]}</span>
      </div>
      <div className="hk-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`hk-seat${turn === s && !done ? " active" : ""}`}>
            <div className="hk-seat-label">{SEAT_NAMES[s]}</div>
            <div className="hk-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="hk-card-back" />)}
            </div>
            <div className="hk-seat-label">Won: {tricks[s]}</div>
          </div>
        ))}
      </div>

      {phase === "chooseTrump" && turn === 0 && (
        <div className="hk-trick-area">
          <div className="hk-label">You are Hakem — choose trump suit:</div>
          <div className="hk-trump-buttons">
            {SUITS.map(suit => (
              <button key={suit} className="hk-btn" onClick={() => dispatch({ type: "chooseTrump", suit } as HokmAction)}>
                {suit}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="hk-trick-area">
          <div className="hk-label">Current Trick</div>
          <div className="hk-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4 }}>—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="hk-trick-slot">
                  <div className="hk-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="hk-status">{message}</div>

      <div className="hk-player-area">
        <div className="hk-player-label">Your Hand — Won: {tricks[0]}</div>
        <div className="hk-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as HokmAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>

      {done && (
        <div className="hk-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Team 0: <strong>{teamScore[0]}</strong> | Team 1: <strong>{teamScore[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
