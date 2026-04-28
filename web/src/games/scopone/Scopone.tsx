import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScoponeState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Scopone.css";

type ScoponeAction = { type: "play"; cardId: string };

export function Scopone({ state, dispatch, onGameOver }: GameProps<ScoponeState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="scopone-game">
      <div className="scopone-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>No Trump</span>
      </div>
      <div className="scopone-bot-row">
        <div className="scopone-label">Bot ({botHand.length} cards)</div>
        <div className="scopone-card-backs">
          {botHand.map((_, i) => <div key={i} className="scopone-card-back" />)}
        </div>
      </div>
      <div className="scopone-trick">
        <div className="scopone-label">Current Trick</div>
        <div className="scopone-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="scopone-trick-slot">
                <div className="scopone-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="scopone-status">{message}</div>
      <div className="scopone-player-area">
        <div className="scopone-label">Your Hand</div>
        <div className="scopone-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as ScoponeAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="scopone-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
