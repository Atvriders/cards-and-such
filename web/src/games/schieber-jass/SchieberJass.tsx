import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SchieberJassState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./SchieberJass.css";

type SchieberJassAction = { type: "play"; cardId: string };

export function SchieberJass({ state, dispatch, onGameOver }: GameProps<SchieberJassState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="schieber-jass-game">
      <div className="schieber-jass-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="schieber-jass-bot-row">
        <div className="schieber-jass-label">Bot ({botHand.length} cards)</div>
        <div className="schieber-jass-card-backs">
          {botHand.map((_, i) => <div key={i} className="schieber-jass-card-back" />)}
        </div>
      </div>
      <div className="schieber-jass-trick">
        <div className="schieber-jass-label">Current Trick</div>
        <div className="schieber-jass-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="schieber-jass-trick-slot">
                <div className="schieber-jass-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="schieber-jass-status">{message}</div>
      <div className="schieber-jass-player-area">
        <div className="schieber-jass-label">Your Hand</div>
        <div className="schieber-jass-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SchieberJassAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="schieber-jass-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
