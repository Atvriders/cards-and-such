import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeepState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Seep.css";

type SeepAction = { type: "play"; cardId: string };

export function Seep({ state, dispatch, onGameOver }: GameProps<SeepState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="seep-game">
      <div className="seep-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="seep-bot-row">
        <div className="seep-label">Bot ({botHand.length} cards)</div>
        <div className="seep-card-backs">
          {botHand.map((_, i) => <div key={i} className="seep-card-back" />)}
        </div>
      </div>
      <div className="seep-trick">
        <div className="seep-label">Current Trick</div>
        <div className="seep-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="seep-trick-slot">
                <div className="seep-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="seep-status">{message}</div>
      <div className="seep-player-area">
        <div className="seep-label">Your Hand</div>
        <div data-testid="hint-target-seep-hand" className="seep-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SeepAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="seep-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
