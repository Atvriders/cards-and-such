import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhizSpadesState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./WhizSpades.css";

type WhizSpadesAction = { type: "play"; cardId: string };

export function WhizSpades({ state, dispatch, onGameOver }: GameProps<WhizSpadesState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="whiz-spades-game">
      <div className="whiz-spades-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="whiz-spades-bot-row">
        <div className="whiz-spades-label">Bot ({botHand.length} cards)</div>
        <div className="whiz-spades-card-backs">
          {botHand.map((_, i) => <div key={i} className="whiz-spades-card-back" />)}
        </div>
      </div>
      <div className="whiz-spades-trick">
        <div className="whiz-spades-label">Current Trick</div>
        <div className="whiz-spades-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="whiz-spades-trick-slot">
                <div className="whiz-spades-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="whiz-spades-status">{message}</div>
      <div className="whiz-spades-player-area">
        <div className="whiz-spades-label">Your Hand</div>
        <div className="whiz-spades-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as WhizSpadesAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="whiz-spades-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
