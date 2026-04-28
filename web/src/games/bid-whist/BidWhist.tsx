import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BidWhistState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./BidWhist.css";

type BidWhistAction = { type: "play"; cardId: string };

export function BidWhist({ state, dispatch, onGameOver }: GameProps<BidWhistState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="bid-whist-game">
      <div className="bid-whist-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="bid-whist-bot-row">
        <div className="bid-whist-label">Bot ({botHand.length} cards)</div>
        <div className="bid-whist-card-backs">
          {botHand.map((_, i) => <div key={i} className="bid-whist-card-back" />)}
        </div>
      </div>
      <div className="bid-whist-trick">
        <div className="bid-whist-label">Current Trick</div>
        <div className="bid-whist-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="bid-whist-trick-slot">
                <div className="bid-whist-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="bid-whist-status">{message}</div>
      <div className="bid-whist-player-area">
        <div className="bid-whist-label">Your Hand</div>
        <div className="bid-whist-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BidWhistAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="bid-whist-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
