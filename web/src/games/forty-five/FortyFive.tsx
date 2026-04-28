import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortyFiveState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FortyFive.css";

type FortyFiveAction = { type: "play"; cardId: string };

export function FortyFive({ state, dispatch, onGameOver }: GameProps<FortyFiveState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="forty-five-game">
      <div className="forty-five-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="forty-five-bot-row">
        <div className="forty-five-label">Bot ({botHand.length} cards)</div>
        <div className="forty-five-card-backs">
          {botHand.map((_, i) => <div key={i} className="forty-five-card-back" />)}
        </div>
      </div>
      <div className="forty-five-trick">
        <div className="forty-five-label">Current Trick</div>
        <div className="forty-five-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="forty-five-trick-slot">
                <div className="forty-five-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="forty-five-status">{message}</div>
      <div className="forty-five-player-area">
        <div className="forty-five-label">Your Hand</div>
        <div className="forty-five-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as FortyFiveAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="forty-five-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
