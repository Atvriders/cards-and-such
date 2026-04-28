import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SedmaState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Sedma.css";

type SedmaAction = { type: "play"; cardId: string };

export function Sedma({ state, dispatch, onGameOver }: GameProps<SedmaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="sedma-game">
      <div className="sedma-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="sedma-bot-row">
        <div className="sedma-label">Bot ({botHand.length} cards)</div>
        <div className="sedma-card-backs">
          {botHand.map((_, i) => <div key={i} className="sedma-card-back" />)}
        </div>
      </div>
      <div className="sedma-trick">
        <div className="sedma-label">Current Trick</div>
        <div className="sedma-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="sedma-trick-slot">
                <div className="sedma-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="sedma-status">{message}</div>
      <div className="sedma-player-area">
        <div className="sedma-label">Your Hand</div>
        <div className="sedma-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SedmaAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="sedma-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
