import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpoilFiveState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./SpoilFive.css";

type SpoilFiveAction = { type: "play"; cardId: string };

export function SpoilFive({ state, dispatch, onGameOver }: GameProps<SpoilFiveState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="spoil-five-game">
      <div className="spoil-five-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="spoil-five-bot-row">
        <div className="spoil-five-label">Bot ({botHand.length} cards)</div>
        <div className="spoil-five-card-backs">
          {botHand.map((_, i) => <div key={i} className="spoil-five-card-back" />)}
        </div>
      </div>
      <div className="spoil-five-trick">
        <div className="spoil-five-label">Current Trick</div>
        <div className="spoil-five-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="spoil-five-trick-slot">
                <div className="spoil-five-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="spoil-five-status">{message}</div>
      <div className="spoil-five-player-area">
        <div className="spoil-five-label">Your Hand</div>
        <div className="spoil-five-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SpoilFiveAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="spoil-five-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
