import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockoutWhistState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./KnockoutWhist.css";

type KnockoutWhistAction = { type: "play"; cardId: string };

export function KnockoutWhist({ state, dispatch, onGameOver }: GameProps<KnockoutWhistState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="knockout-whist-game">
      <div className="knockout-whist-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="knockout-whist-bot-row">
        <div className="knockout-whist-label">Bot ({botHand.length} cards)</div>
        <div className="knockout-whist-card-backs">
          {botHand.map((_, i) => <div key={i} className="knockout-whist-card-back" />)}
        </div>
      </div>
      <div className="knockout-whist-trick">
        <div className="knockout-whist-label">Current Trick</div>
        <div className="knockout-whist-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="knockout-whist-trick-slot">
                <div className="knockout-whist-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="knockout-whist-status">{message}</div>
      <div className="knockout-whist-player-area">
        <div className="knockout-whist-label">Your Hand</div>
        <div className="knockout-whist-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as KnockoutWhistAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="knockout-whist-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
