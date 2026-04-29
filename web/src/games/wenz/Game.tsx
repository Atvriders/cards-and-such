import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type GAction = { type: "play"; cardId: string };

export function WenzGame({ state, dispatch, onGameOver }: GameProps<GState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="trick-game">
      <div className="trick-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>{TRUMP_SUIT ? `Trump: ${TRUMP_SUIT}` : "No Trump"}</span>
      </div>
      <div className="trick-bot-row">
        <div className="trick-label">Bot ({botHand.length} cards)</div>
        <div className="trick-card-backs">
          {botHand.map((_, i) => <div key={i} className="trick-card-back" />)}
        </div>
      </div>
      <div className="trick-area">
        <div className="trick-label">Current Trick</div>
        <div className="trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="trick-slot">
                <div className="trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="trick-status">{message}</div>
      <div className="trick-player-area">
        <div className="trick-label">Your Hand</div>
        <div className="trick-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as GAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="trick-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
    </div>
  );
}
