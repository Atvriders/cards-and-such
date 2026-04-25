import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PidroState, PidroSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Pidro.css";

type PidroAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2*", "Bot 3"];

export function Pidro({ state, dispatch, onGameOver }: GameProps<PidroState, PidroSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, bids, highBid, highBidder, tricks, teamPoints, teamScore, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && phase === "playing" && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="pidro">
      <div className="pid-header">
        <span>Team 0 (You+Bot2): {teamScore[0]} pts</span>
        <span>Team 1 (Bot1+Bot3): {teamScore[1]} pts</span>
        {trumpSuit && <span>Trump: {trumpSuit}</span>}
        <span>Tricks: T0={teamPoints[0]} T1={teamPoints[1]}</span>
      </div>
      <div className="pid-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`pid-seat${turn === s && !done ? " active" : ""}`}>
            <div className="pid-seat-label">{SEAT_NAMES[s]}</div>
            <div className="pid-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="pid-card-back" />)}
            </div>
            <div className="pid-seat-label">Bid:{bids[s]??'?'} W:{tricks[s]}</div>
          </div>
        ))}
      </div>
      {phase === "bidding" && (
        <div className="pid-bid-area">
          <div className="pid-label">Bid 2-6 or Pass (0). High bid={highBid} by {SEAT_NAMES[highBidder]}</div>
          <div className="pid-bid-buttons">
            {[0, 2, 3, 4, 5, 6].map(i => (
              <button key={i} className="pid-btn" onClick={() => dispatch({ type: "bid", amount: i } as PidroAction)}>
                {i === 0 ? "Pass" : i}
              </button>
            ))}
          </div>
        </div>
      )}
      {phase === "playing" && (
        <div className="pid-trick-area">
          <div className="pid-label">Current Trick</div>
          <div className="pid-trick-cards">
            {currentTrick.length === 0
              ? <span style={{ opacity: 0.4 }}>—</span>
              : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="pid-trick-slot">
                  <div className="pid-trick-name">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="pid-status">{message}</div>
      <div className="pid-player-area">
        <div className="pid-player-label">Your Hand — Won: {tricks[0]}</div>
        <div className="pid-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as PidroAction)} />
              : <Card key={card.id} card={card} className={phase === "playing" && turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="pid-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          <div>Team 0: <strong>{teamScore[0]}</strong> | Team 1: <strong>{teamScore[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
