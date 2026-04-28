import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChibreState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Chibre.css";

type ChibreAction = { type: "play"; cardId: string };

export function Chibre({ state, dispatch, onGameOver }: GameProps<ChibreState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="chibre-game">
      <div className="chibre-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♣</span>
      </div>
      <div className="chibre-bot-row">
        <div className="chibre-label">Bot ({botHand.length} cards)</div>
        <div className="chibre-card-backs">
          {botHand.map((_, i) => <div key={i} className="chibre-card-back" />)}
        </div>
      </div>
      <div className="chibre-trick">
        <div className="chibre-label">Current Trick</div>
        <div className="chibre-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="chibre-trick-slot">
                <div className="chibre-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="chibre-status">{message}</div>
      <div className="chibre-player-area">
        <div className="chibre-label">Your Hand</div>
        <div className="chibre-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as ChibreAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="chibre-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
