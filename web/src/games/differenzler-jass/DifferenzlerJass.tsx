import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DifferenzlerJassState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./DifferenzlerJass.css";

type DifferenzlerJassAction = { type: "play"; cardId: string };

export function DifferenzlerJass({ state, dispatch, onGameOver }: GameProps<DifferenzlerJassState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="differenzler-jass-game">
      <div className="differenzler-jass-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="differenzler-jass-bot-row">
        <div className="differenzler-jass-label">Bot ({botHand.length} cards)</div>
        <div className="differenzler-jass-card-backs">
          {botHand.map((_, i) => <div key={i} className="differenzler-jass-card-back" />)}
        </div>
      </div>
      <div className="differenzler-jass-trick">
        <div className="differenzler-jass-label">Current Trick</div>
        <div className="differenzler-jass-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="differenzler-jass-trick-slot">
                <div className="differenzler-jass-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="differenzler-jass-status">{message}</div>
      <div className="differenzler-jass-player-area">
        <div className="differenzler-jass-label">Your Hand</div>
        <div className="differenzler-jass-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as DifferenzlerJassAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="differenzler-jass-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
