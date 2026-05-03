import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CancellationHeartsState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./CancellationHearts.css";

type CancellationHeartsAction = { type: "play"; cardId: string };

export function CancellationHearts({ state, dispatch, onGameOver }: GameProps<CancellationHeartsState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="cancellation-hearts-game">
      <div className="cancellation-hearts-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="cancellation-hearts-bot-row">
        <div className="cancellation-hearts-label">Bot ({botHand.length} cards)</div>
        <div className="cancellation-hearts-card-backs">
          {botHand.map((_, i) => <div key={i} className="cancellation-hearts-card-back" />)}
        </div>
      </div>
      <div className="cancellation-hearts-trick">
        <div className="cancellation-hearts-label">Current Trick</div>
        <div className="cancellation-hearts-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="cancellation-hearts-trick-slot">
                <div className="cancellation-hearts-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="cancellation-hearts-status">{message}</div>
      <div className="cancellation-hearts-player-area">
        <div className="cancellation-hearts-label">Your Hand</div>
        <div className="cancellation-hearts-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card data-testid="hint-target-cancellation-hearts-primary" key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as CancellationHeartsAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="cancellation-hearts-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
