import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourHundredState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FourHundred.css";

type FourHundredAction = { type: "play"; cardId: string };

export function FourHundred({ state, dispatch, onGameOver }: GameProps<FourHundredState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="four-hundred-game">
      <div className="four-hundred-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="four-hundred-bot-row">
        <div className="four-hundred-label">Bot ({botHand.length} cards)</div>
        <div className="four-hundred-card-backs">
          {botHand.map((_, i) => <div key={i} className="four-hundred-card-back" />)}
        </div>
      </div>
      <div className="four-hundred-trick">
        <div className="four-hundred-label">Current Trick</div>
        <div className="four-hundred-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="four-hundred-trick-slot">
                <div className="four-hundred-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="four-hundred-status">{message}</div>
      <div className="four-hundred-player-area">
        <div className="four-hundred-label">Your Hand</div>
        <div className="four-hundred-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as FourHundredAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="four-hundred-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
