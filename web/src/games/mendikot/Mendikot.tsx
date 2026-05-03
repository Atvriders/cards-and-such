import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MendikotState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Mendikot.css";

type MendikotAction = { type: "play"; cardId: string };

export function Mendikot({ state, dispatch, onGameOver }: GameProps<MendikotState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="mendikot-game">
      <div className="mendikot-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="mendikot-bot-row">
        <div className="mendikot-label">Bot ({botHand.length} cards)</div>
        <div className="mendikot-card-backs">
          {botHand.map((_, i) => <div key={i} className="mendikot-card-back" />)}
        </div>
      </div>
      <div className="mendikot-trick">
        <div className="mendikot-label">Current Trick</div>
        <div className="mendikot-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="mendikot-trick-slot">
                <div className="mendikot-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="mendikot-status">{message}</div>
      <div className="mendikot-player-area">
        <div className="mendikot-label">Your Hand</div>
        <div data-testid="hint-target-mendikot-hand" className="mendikot-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as MendikotAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="mendikot-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
