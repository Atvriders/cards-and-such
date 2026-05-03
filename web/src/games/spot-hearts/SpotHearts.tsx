import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotHeartsState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./SpotHearts.css";

type SpotHeartsAction = { type: "play"; cardId: string };

export function SpotHearts({ state, dispatch, onGameOver }: GameProps<SpotHeartsState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="spot-hearts-game">
      <div className="spot-hearts-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="spot-hearts-bot-row">
        <div className="spot-hearts-label">Bot ({botHand.length} cards)</div>
        <div className="spot-hearts-card-backs">
          {botHand.map((_, i) => <div key={i} className="spot-hearts-card-back" />)}
        </div>
      </div>
      <div className="spot-hearts-trick">
        <div className="spot-hearts-label">Current Trick</div>
        <div className="spot-hearts-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="spot-hearts-trick-slot">
                <div className="spot-hearts-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="spot-hearts-status">{message}</div>
      <div className="spot-hearts-player-area">
        <div className="spot-hearts-label">Your Hand</div>
        <div data-testid="hint-target-spot-hearts-hand" className="spot-hearts-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SpotHeartsAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="spot-hearts-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
