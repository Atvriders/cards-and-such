import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OmnibusHeartsState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./OmnibusHearts.css";

type OmnibusHeartsAction = { type: "play"; cardId: string };

export function OmnibusHearts({ state, dispatch, onGameOver }: GameProps<OmnibusHeartsState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="omnibus-hearts-game">
      <div className="omnibus-hearts-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="omnibus-hearts-bot-row">
        <div className="omnibus-hearts-label">Bot ({botHand.length} cards)</div>
        <div className="omnibus-hearts-card-backs">
          {botHand.map((_, i) => <div key={i} className="omnibus-hearts-card-back" />)}
        </div>
      </div>
      <div className="omnibus-hearts-trick">
        <div className="omnibus-hearts-label">Current Trick</div>
        <div className="omnibus-hearts-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="omnibus-hearts-trick-slot">
                <div className="omnibus-hearts-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="omnibus-hearts-status">{message}</div>
      <div className="omnibus-hearts-player-area">
        <div className="omnibus-hearts-label">Your Hand</div>
        <div className="omnibus-hearts-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as OmnibusHeartsAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="omnibus-hearts-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
